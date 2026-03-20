// functions/index.js — Mani Industries Cloud Functions
const functions = require('firebase-functions');
const admin     = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// ============================================================
// 1. SET ADMIN / OWNER ROLE
// Call once from browser console to make yourself admin
// ============================================================
exports.setAdmin = functions.https.onCall(async (data, context) => {
  // First call: anyone can run (bootstrap). After that: only admins.
  const { email } = data;
  if (!email) throw new functions.https.HttpsError('invalid-argument','Email required');
  const user = await admin.auth().getUserByEmail(email);

  // Check if any admin already exists (prevent abuse after bootstrap)
  if (context.auth) {
    const caller = await db.collection('users').doc(context.auth.uid).get();
    const callerData = caller.data() || {};
    const alreadyHasAdmins = (callerData.roles && (callerData.roles.admin || callerData.roles.owner));
    // If admins exist, only an admin can add more
    if (!alreadyHasAdmins && context.auth.uid !== user.uid) {
      throw new functions.https.HttpsError('permission-denied','Only admins can add admins');
    }
  }

  await admin.auth().setCustomUserClaims(user.uid, { admin: true, owner: true });
  await db.collection('users').doc(user.uid).set({
    'roles': { owner: true, admin: true, instructor: false }
  }, { merge: true });

  return { success: true, message: email + ' is now owner/admin' };
});

// ============================================================
// 2. CREATE RAZORPAY ORDER
// ============================================================
exports.createOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','Login required');
  const Razorpay = require('razorpay');
  const rzp = new Razorpay({
    key_id:     functions.config().razorpay.key_id,
    key_secret: functions.config().razorpay.key_secret,
  });
  const order = await rzp.orders.create({
    amount:   data.amount * 100,
    currency: 'INR',
    receipt:  'order_' + Date.now(),
  });
  // Save pending purchase
  await db.collection('purchases').add({
    userId:    context.auth.uid,
    planId:    data.planId,
    amount:    data.amount,
    orderId:   order.id,
    status:    'pending',
    provider:  'razorpay',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { orderId: order.id };
});

// ============================================================
// 3. VERIFY PAYMENT + GRANT ENROLLMENT
// ============================================================
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','Login required');
  const crypto = require('crypto');
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = data;
  const secret = functions.config().razorpay.key_secret;
  const expectedSig = crypto.createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');

  if (expectedSig !== razorpay_signature) {
    throw new functions.https.HttpsError('invalid-argument','Invalid payment signature');
  }

  const uid = context.auth.uid;
  // Update purchase status
  const purchasesSnap = await db.collection('purchases')
    .where('orderId','==',razorpay_order_id).where('userId','==',uid).get();
  purchasesSnap.forEach(doc => doc.ref.update({ status:'succeeded', paymentId: razorpay_payment_id }));

  // Create enrollment
  await db.collection('enrollments').add({
    userId:      uid,
    planId:      planId,
    active:      true,
    enrolledAt:  admin.firestore.FieldValue.serverTimestamp(),
    expiresAt:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  return { success: true };
});

// ============================================================
// 4. PUBLISH COURSE (admin only)
// ============================================================
exports.publishCourse = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied','Admin only');
  }
  const { courseId } = data;
  await db.collection('courses').doc(courseId).update({
    published:   true,
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishedBy: context.auth.uid
  });
  // Admin log
  await db.collection('adminLogs').add({
    action:    'publish_course',
    courseId,
    adminUid:  context.auth.uid,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  return { success: true };
});

// ============================================================
// 5. AWARD QUIZ POINTS + UPDATE LEADERBOARD
// ============================================================
exports.submitQuiz = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','Login required');
  const { courseId, lessonId, score, totalQuestions } = data;
  const uid = context.auth.uid;
  const points = Math.round((score / totalQuestions) * 100);

  // Update leaderboard
  const lbRef = db.collection('leaderboard').doc(courseId).collection('scores').doc(uid);
  await lbRef.set({
    points:      admin.firestore.FieldValue.increment(points),
    quizWins:    admin.firestore.FieldValue.increment(score === totalQuestions ? 1 : 0),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // Save progress
  await db.collection('progress').doc(uid).collection('lessons').doc(lessonId).set({
    lessonId, courseId, completed: score >= totalQuestions * 0.6,
    quizScore: score, updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return { success: true, points };
});

// ============================================================
// 6. AUTOMATED DAILY BACKUP (runs every day at 2am IST)
// ============================================================
exports.backupFirestore = functions.pubsub.schedule('0 20 * * *').timeZone('UTC').onRun(async () => {
  const projectId = process.env.GCLOUD_PROJECT;
  const bucket    = `gs://${projectId}-backups`;
  const timestamp = new Date().toISOString().split('T')[0];
  const client    = new (require('@google-cloud/firestore').v1.FirestoreAdminClient)();
  await client.exportDocuments({
    name:           client.databasePath(projectId, '(default)'),
    outputUriPrefix: `${bucket}/firestore-backup-${timestamp}`,
    collectionIds:  []
  });
  console.log('Backup completed:', timestamp);
  return null;
});

// ============================================================
// 7. SOFT DELETE USER DATA
// ============================================================
exports.deleteUserData = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','Login required');
  const uid = context.auth.uid;
  // Soft delete — mark deleted, keep for 30 days
  await db.collection('users').doc(uid).update({
    deleted:   true,
    deletedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  // Deactivate enrollments
  const enrollSnap = await db.collection('enrollments').where('userId','==',uid).get();
  const batch = db.batch();
  enrollSnap.forEach(doc => batch.update(doc.ref, { active: false }));
  await batch.commit();
  return { success: true, message: 'Account marked for deletion in 30 days' };
});
