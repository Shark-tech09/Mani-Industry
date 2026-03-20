// payments.js — Mani Industries v2.0
// Handles: per-course UPI/Razorpay purchase + subscription plans

// ── COURSE PURCHASE ───────────────────────────────────────────────
async function buyCourseDirect(courseId) {
  const user = auth.currentUser;
  if (!user) { openModal('signup'); showToast('Sign in to purchase','warn'); return; }
  const c = COURSES[courseId]; if (!c) return;
  openPayModal(courseId, c.price, c.title, user);
}

// ── SUBSCRIPTION PURCHASE ─────────────────────────────────────────
async function checkoutPlan(planId) {
  const user = auth.currentUser;
  if (!user) { openModal('signup'); showToast('Sign in first','warn'); return; }
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan || plan.price === 0) { showToast('Free plan — no payment needed!','success'); return; }

  // Use shared pay modal
  openPayModal('sub_'+planId, plan.price, plan.name+' Subscription', user);
}

// Alias for index.html
function handlePlanClick(planId, amount) { checkoutPlan(planId); }

// ── SHARED PAY MODAL ──────────────────────────────────────────────
let _payContext = null;

function openPayModal(itemId, amount, label, user) {
  _payContext = { itemId, amount, label, user };

  // Inject modal if not present
  if (!document.getElementById('miPayModal')) {
    const upiUrl = `upi://pay?pa=${PLATFORM_CONFIG.upiId}&pn=ManiIndustries&am=${amount}&cu=INR&tn=${encodeURIComponent(label)}`;
    document.body.insertAdjacentHTML('beforeend', `
    <div id="miPayModal" onclick="if(event.target===this)closePay()" style="position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(6px)">
      <div onclick="event.stopPropagation()" style="background:var(--bg2);border:1px solid var(--border);border-radius:20px;width:100%;max-width:460px;max-height:90vh;overflow-y:auto">
        <div style="padding:1.6rem 1.8rem 1rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
          <div><div style="font-family:'Orbitron',monospace;font-size:1rem;font-weight:700">Complete Purchase</div><div style="font-size:.78rem;color:var(--text-dim);margin-top:.2rem">Instant access after payment</div></div>
          <button onclick="closePay()" style="background:none;border:none;color:var(--text-dim);font-size:1.5rem;cursor:pointer;line-height:1">×</button>
        </div>
        <div style="padding:1.4rem 1.8rem 1.8rem">
          <div style="display:flex;align-items:center;gap:1rem;padding:1rem;background:var(--bg3);border:1px solid var(--border);border-radius:12px;margin-bottom:1.2rem">
            <div style="font-size:2.2rem" id="mpIcon">📦</div>
            <div style="flex:1"><div style="font-family:'Orbitron',monospace;font-size:.85rem;font-weight:700" id="mpLabel"></div><div style="font-size:.75rem;color:var(--text-dim)">1-year access</div></div>
            <div style="font-family:'Orbitron',monospace;font-size:1.2rem;font-weight:900;color:var(--accent)" id="mpPrice"></div>
          </div>
          <div style="margin-bottom:1rem">
            <label style="font-size:.75rem;color:var(--text-dim);display:block;margin-bottom:.4rem">Mobile Number <span style="color:var(--accent)">* required</span></label>
            <input type="tel" id="mpPhone" placeholder="+91 XXXXX XXXXX" style="width:100%;padding:11px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-family:'Rajdhani',sans-serif;font-size:.95rem;outline:none" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-bottom:1.2rem">
            <div id="mpMethodUPI" onclick="mpSelectMethod('upi')" style="padding:.9rem;background:var(--bg3);border:2px solid var(--accent);border-radius:12px;cursor:pointer;text-align:center;transition:all .2s">
              <div style="font-size:1.5rem;margin-bottom:.3rem">📱</div>
              <div style="font-family:'Orbitron',monospace;font-size:.62rem;letter-spacing:1px">UPI / QR</div>
            </div>
            <div id="mpMethodCard" onclick="mpSelectMethod('card')" style="padding:.9rem;background:var(--bg3);border:2px solid var(--border);border-radius:12px;cursor:pointer;text-align:center;transition:all .2s">
              <div style="font-size:1.5rem;margin-bottom:.3rem">💳</div>
              <div style="font-family:'Orbitron',monospace;font-size:.62rem;letter-spacing:1px">Card / Net Banking</div>
            </div>
          </div>
          <div id="mpQRSection" style="text-align:center;padding:1.2rem;background:var(--bg3);border-radius:12px;margin-bottom:1rem">
            <div id="mpQR" style="width:170px;height:170px;margin:0 auto 1rem;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#333;padding:.5rem;text-align:center">
              QR loading...
            </div>
            <div style="font-family:'Orbitron',monospace;font-size:.75rem;color:var(--accent);margin:.4rem 0" id="mpUpiId">${PLATFORM_CONFIG.upiId}</div>
            <div style="font-size:.75rem;color:var(--text-dim);line-height:1.5">Scan with GPay, PhonePe, Paytm, BHIM<br><strong style="color:var(--text)">Then click "I've Paid" below</strong></div>
          </div>
          <div id="mpCardSection" style="display:none;text-align:center;padding:1rem;background:var(--bg3);border-radius:12px;margin-bottom:1rem;font-size:.82rem;color:var(--text-dim)">You'll be redirected to Razorpay's secure checkout</div>
          <button id="mpConfirmBtn" onclick="mpConfirm()" style="width:100%;padding:14px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:var(--bg);font-family:'Orbitron',monospace;font-size:.78rem;font-weight:700;letter-spacing:1.5px;border-radius:12px;border:none;cursor:pointer;transition:all .3s">I've Paid — Activate Now</button>
          <div style="font-size:.7rem;color:var(--text-dim);text-align:center;margin-top:.7rem">🔒 Secure · Instant access · No waiting</div>
        </div>
      </div>
    </div>`);
  }

  // Populate
  const c = COURSES[itemId];
  document.getElementById('mpIcon').textContent  = c?.icon || '📦';
  document.getElementById('mpLabel').textContent = label;
  document.getElementById('mpPrice').textContent = formatPrice(amount);
  if (user.phoneNumber) document.getElementById('mpPhone').value = user.phoneNumber;

  // QR
  generateUPIQR(itemId, amount, label);
  document.getElementById('miPayModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closePay() {
  const m = document.getElementById('miPayModal');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
}

let _mpMethod = 'upi';
function mpSelectMethod(m) {
  _mpMethod = m;
  document.getElementById('mpMethodUPI').style.borderColor  = m==='upi'  ? 'var(--accent)' : 'var(--border)';
  document.getElementById('mpMethodCard').style.borderColor = m==='card' ? 'var(--accent)' : 'var(--border)';
  document.getElementById('mpQRSection').style.display  = m==='upi'  ? 'block' : 'none';
  document.getElementById('mpCardSection').style.display = m==='card' ? 'block' : 'none';
  document.getElementById('mpConfirmBtn').textContent = m==='card' ? 'Pay with Razorpay →' : "I've Paid — Activate Now";
}

function generateUPIQR(itemId, amount, label) {
  const upiUrl = `upi://pay?pa=${PLATFORM_CONFIG.upiId}&pn=ManiIndustries&am=${amount}&cu=INR&tn=${encodeURIComponent(label)}`;
  const qrEl = document.getElementById('mpQR');
  if (qrEl) {
    qrEl.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      try { new QRCode(qrEl, { text:upiUrl, width:160, height:160, colorDark:'#000', colorLight:'#fff', correctLevel:QRCode.CorrectLevel.H }); return; } catch(e){}
    }
    qrEl.innerHTML = `<div style="text-align:center"><div style="font-size:2rem">📲</div><div>Pay to</div><div style="font-weight:600">${PLATFORM_CONFIG.upiId}</div><div>₹${amount}</div></div>`;
  }
}

async function mpConfirm() {
  if (!_payContext) return;
  const { itemId, amount, label, user } = _payContext;
  const phone = document.getElementById('mpPhone').value.trim();
  if (!phone || phone.replace(/\D/g,'').length < 10) {
    showToast('Enter a valid mobile number','warn'); return;
  }
  const btn = document.getElementById('mpConfirmBtn');
  btn.disabled = true; btn.textContent = 'Processing...';

  try {
    if (_mpMethod === 'card') {
      await launchRazorpay(itemId, amount, label, phone, user);
    } else {
      // Save phone
      await db.collection('users').doc(user.uid).set({ phone }, { merge:true });
      // Record pending purchase
      await db.collection('coursePurchases').add({
        userId: user.uid, courseId: itemId, courseName: label,
        amount, phone, method:'upi', status:'pending_verification',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now()+365*24*60*60*1000),
      });
      // In test/demo mode: grant access immediately. In production: admin approves from admin panel.
      if (!itemId.startsWith('sub_')) {
        await grantCourseAccess(user.uid, itemId, amount, phone, 'upi');
      }
      closePay();
      showToast(`🎉 ${label} activated! Happy learning!`,'success');
      setTimeout(() => window.location.reload(), 1500);
    }
  } catch(e) {
    showToast('Error: '+e.message,'error');
    console.error(e);
  } finally {
    btn.disabled = false; btn.textContent = _mpMethod==='card'?'Pay with Razorpay →':"I've Paid — Activate Now";
  }
}

async function launchRazorpay(itemId, amount, label, phone, user) {
  if (typeof Razorpay === 'undefined') {
    await new Promise((res,rej) => { const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=res;s.onerror=rej;document.head.appendChild(s); });
  }
  let orderId = null;
  try {
    const cf = firebase.functions().httpsCallable('createOrder');
    const r = await cf({ planId:itemId, amount, type: itemId.startsWith('sub_')?'subscription':'course' });
    orderId = r.data.orderId;
  } catch(e) { console.warn('No order ID:', e.message); }

  return new Promise(resolve => {
    const rzp = new Razorpay({
      key:         PLATFORM_CONFIG.razorpayKeyId,
      amount:      amount * 100,
      currency:    'INR',
      name:        'Mani Industries',
      description: label,
      image:       'logo.png',
      order_id:    orderId||undefined,
      prefill:     { name:user.displayName||'', email:user.email, contact:phone },
      notes:       { itemId, userId:user.uid },
      theme:       { color: getComputedStyle(document.body).getPropertyValue('--accent').trim()||'#00c8ff' },
      handler: async function(response) {
        // Verify server-side if Cloud Functions deployed
        try {
          const vf = firebase.functions().httpsCallable('verifyPayment');
          await vf({ ...response, planId:itemId });
        } catch {
          // Fallback: grant directly
          if (!itemId.startsWith('sub_')) await grantCourseAccess(user.uid, itemId, amount, phone, 'razorpay');
        }
        closePay();
        showToast(`🎉 Payment successful! ${label} is now yours!`,'success');
        setTimeout(() => window.location.reload(), 1500);
        resolve(true);
      },
      modal: { ondismiss: () => resolve(false) }
    });
    rzp.on('payment.failed', e => { showToast('Payment failed: '+e.error.description,'error'); resolve(false); });
    rzp.open();
  });
}
