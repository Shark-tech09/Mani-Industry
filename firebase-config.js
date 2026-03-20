// ╔══════════════════════════════════════════════════════════════╗
// ║  firebase-config.js  —  Mani Industries v2.0                ║
// ║  Safe init: never crashes — loading screen always works      ║
// ╚══════════════════════════════════════════════════════════════╝

const firebaseConfig = {
  apiKey: "AIzaSyAN0qNPj-gOhPzT1VH-ekGBCehqQIf7i5E",
  authDomain: "mani-industries-ff6fa.firebaseapp.com",
  // ── Enable Realtime Database in Firebase Console first, then this URL works ──
  databaseURL: "https://mani-industries-ff6fa-default-rtdb.firebaseio.com",
  projectId: "mani-industries-ff6fa",
  storageBucket: "mani-industries-ff6fa.firebasestorage.app",
  messagingSenderId: "106717380551",
  appId: "1:106717380551:web:f3f7c2e92e4fbe858023e2"
};
  

// ── Safe init — never throws, never blocks loading screen ────────
let auth, db, storage, rtdb;

try {
  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  auth    = firebase.auth();
  db      = firebase.firestore();
  storage = firebase.storage();
} catch(e) {
  console.warn('[firebase-config] Core init error:', e.message);
}

// Realtime DB is optional — only initialise if the SDK is loaded
// AND Realtime Database has been created in your Firebase console
try {
  if (typeof firebase.database === 'function') {
    rtdb = firebase.database();
  }
} catch(e) {
  console.warn('[firebase-config] Realtime DB not ready yet:', e.message);
  rtdb = null;
}

// Firestore offline persistence — safe, non-blocking
if (db) {
  db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
}

// ══════════════════════════════════════════════════════════════════
//  PLATFORM CONFIG
// ══════════════════════════════════════════════════════════════════
const PLATFORM_CONFIG = {
  upiId:         'maniindustries@upi',
  razorpayKeyId: 'rzp_test_XXXXXXXXXX',
  supportPhone:  '+91-XXXXXXXXXX',
  supportEmail:  'support@maniindustries.com',
};

// ══════════════════════════════════════════════════════════════════
//  COURSES
// ══════════════════════════════════════════════════════════════════
const COURSES = {
  webdev:{id:'webdev',title:'Web Development',icon:'🌐',color:'#00c8ff',level:'Beginner',weeks:12,price:2000,cat:['web'],tags:['HTML','CSS','JavaScript','React','Node.js'],desc:'Full-stack web development from HTML to React and Node.js.',longDesc:'Start your web journey and go all the way to full stack. 12 hands-on projects.',features:['48 video lessons','12 real projects','2 live classes/week','Community channel','Certificate'],modules:[{title:'HTML Foundations',lessons:[{name:'What is HTML?',type:'video',dur:'10m'},{name:'Semantic Tags',type:'video',dur:'14m'},{name:'Forms & Tables',type:'video',dur:'16m'},{name:'Build a Portfolio Page',type:'code',dur:'30m'}]},{title:'CSS Mastery',lessons:[{name:'Selectors & Specificity',type:'video',dur:'12m'},{name:'Flexbox Layout',type:'video',dur:'18m'},{name:'CSS Grid',type:'video',dur:'20m'},{name:'Responsive Design',type:'video',dur:'15m'},{name:'Style the Portfolio',type:'code',dur:'35m'}]},{title:'JavaScript ES6+',lessons:[{name:'Variables & Scope',type:'video',dur:'14m'},{name:'Arrow Functions',type:'video',dur:'16m'},{name:'DOM Manipulation',type:'video',dur:'20m'},{name:'Async/Await',type:'video',dur:'18m'},{name:'Build a Weather App',type:'code',dur:'45m'}]},{title:'React Fundamentals',lessons:[{name:'Components & JSX',type:'video',dur:'18m'},{name:'State & Props',type:'video',dur:'20m'},{name:'useEffect & Hooks',type:'video',dur:'22m'},{name:'React To-Do App',type:'code',dur:'50m'}]},{title:'Node.js & Backend',lessons:[{name:'Node & npm',type:'video',dur:'16m'},{name:'Express REST APIs',type:'video',dur:'22m'},{name:'MongoDB Basics',type:'video',dur:'20m'},{name:'Full Stack Project',type:'code',dur:'60m'}]}]},
  python:{id:'python',title:'Python with Automation',icon:'🐍',color:'#ffd700',level:'Beginner',weeks:10,price:3000,cat:['language','data'],tags:['Python','OOP','Automation','Selenium','Pandas'],desc:'Core Python plus real-world automation — bots, scripts, web scraping and CLI tools.',longDesc:'Learn Python from scratch and apply it to automate real tasks. 6 automation projects.',features:['40 video lessons','6 automation projects','2 live classes/week','Community channel','Certificate'],modules:[{title:'Python Basics',lessons:[{name:'Setup & Hello World',type:'video',dur:'10m'},{name:'Variables & Data Types',type:'video',dur:'14m'},{name:'Lists, Tuples & Dicts',type:'video',dur:'18m'},{name:'Your First Script',type:'code',dur:'25m'}]},{title:'Control Flow',lessons:[{name:'If / Elif / Else',type:'video',dur:'10m'},{name:'For & While Loops',type:'video',dur:'14m'},{name:'List Comprehensions',type:'video',dur:'12m'},{name:'FizzBuzz Challenge',type:'code',dur:'20m'}]},{title:'Functions & OOP',lessons:[{name:'Defining Functions',type:'video',dur:'14m'},{name:'Classes & Objects',type:'video',dur:'20m'},{name:'Inheritance',type:'video',dur:'18m'},{name:'OOP Mini-Project',type:'code',dur:'40m'}]},{title:'Automation',lessons:[{name:'File & Folder Automation',type:'video',dur:'18m'},{name:'Web Scraping with BeautifulSoup',type:'video',dur:'22m'},{name:'Selenium Browser Automation',type:'video',dur:'25m'},{name:'Build a News Scraper',type:'code',dur:'50m'}]}]},
  cpp:{id:'cpp',title:'C++',icon:'⚙️',color:'#ff6b35',level:'Intermediate',weeks:10,price:2000,cat:['language'],tags:['C++','Pointers','Memory','OOP','STL','DSA'],desc:'Systems programming, memory management, pointers and competitive coding.',longDesc:'Go deep into C++ for systems and competitive programming.',features:['38 video lessons','5 projects','2 live classes/week','Community channel','Certificate'],modules:[{title:'C++ Fundamentals',lessons:[{name:'Setup & First Program',type:'video',dur:'10m'},{name:'Data Types & Variables',type:'video',dur:'12m'},{name:'Control Flow',type:'video',dur:'14m'},{name:'Functions & Recursion',type:'video',dur:'18m'}]},{title:'Memory & Pointers',lessons:[{name:'Stack vs Heap',type:'video',dur:'16m'},{name:'Pointers & References',type:'video',dur:'20m'},{name:'Dynamic Memory',type:'video',dur:'18m'},{name:'Memory Challenge',type:'code',dur:'35m'}]},{title:'OOP in C++',lessons:[{name:'Classes & Constructors',type:'video',dur:'18m'},{name:'Inheritance & Virtual',type:'video',dur:'20m'},{name:'STL: vector, map, set',type:'video',dur:'22m'},{name:'Mini-Library Project',type:'code',dur:'45m'}]}]},
  java:{id:'java',title:'Java',icon:'☕',color:'#ff3366',level:'Intermediate',weeks:10,price:2000,cat:['language'],tags:['Java','OOP','DSA','Collections','Enterprise'],desc:'OOP, data structures, algorithms and enterprise Java — interview ready.',longDesc:'Master Java thoroughly for enterprise and interview success.',features:['36 video lessons','5 projects','2 live classes/week','Community channel','Certificate'],modules:[{title:'Java Fundamentals',lessons:[{name:'JDK Setup & Hello World',type:'video',dur:'10m'},{name:'Data Types & Variables',type:'video',dur:'12m'},{name:'Control Flow & Loops',type:'video',dur:'14m'},{name:'Arrays & Strings',type:'video',dur:'16m'}]},{title:'OOP in Java',lessons:[{name:'Classes, Objects & Constructors',type:'video',dur:'18m'},{name:'Inheritance & Polymorphism',type:'video',dur:'20m'},{name:'Collections Framework',type:'video',dur:'22m'},{name:'Java OOP Project',type:'code',dur:'45m'}]},{title:'Data Structures',lessons:[{name:'LinkedLists',type:'video',dur:'18m'},{name:'Stack & Queue',type:'video',dur:'16m'},{name:'Trees & Graphs',type:'video',dur:'22m'},{name:'DSA Challenge Set',type:'code',dur:'60m'}]}]},
  datascience:{id:'datascience',title:'Data Science with Python',icon:'🧠',color:'#8b5cf6',level:'Intermediate',weeks:10,price:2500,cat:['data'],tags:['NumPy','Pandas','Matplotlib','scikit-learn','Kaggle'],desc:'NumPy, Pandas, Matplotlib and ML on real datasets — job-ready data science.',longDesc:'Full Python data stack with 7 real-world datasets.',features:['40 video lessons','7 real datasets','2 live classes/week','Community channel','Certificate'],modules:[{title:'NumPy & Setup',lessons:[{name:'Jupyter Notebooks',type:'video',dur:'12m'},{name:'NumPy Fundamentals',type:'video',dur:'18m'},{name:'NumPy Lab',type:'code',dur:'30m'}]},{title:'Pandas & Wrangling',lessons:[{name:'DataFrames & Series',type:'video',dur:'20m'},{name:'Data Cleaning',type:'video',dur:'18m'},{name:'Merging & Groupby',type:'video',dur:'16m'},{name:'Titanic Dataset Lab',type:'code',dur:'40m'}]},{title:'Visualisation',lessons:[{name:'Matplotlib Fundamentals',type:'video',dur:'16m'},{name:'Seaborn Charts',type:'video',dur:'14m'}]},{title:'ML Intro',lessons:[{name:'scikit-learn Basics',type:'video',dur:'18m'},{name:'Linear Regression',type:'video',dur:'22m'},{name:'Final Project',type:'code',dur:'60m'}]}]},
  ml:{id:'ml',title:'Machine Learning',icon:'🤖',color:'#00ff88',level:'Advanced',weeks:12,price:3000,cat:['data'],tags:['TensorFlow','scikit-learn','Neural Nets','CNN','NLP'],desc:'Supervised & unsupervised learning, neural networks with TensorFlow — build real AI.',longDesc:'Full ML engineering pipeline with 6 deployable projects.',features:['48 video lessons','6 ML projects','2 live classes/week','Community channel','Certificate'],modules:[{title:'ML Foundations',lessons:[{name:'What is ML?',type:'video',dur:'14m'},{name:'Types of ML',type:'video',dur:'12m'},{name:'Environment Setup',type:'video',dur:'10m'}]},{title:'Supervised Learning',lessons:[{name:'Linear Regression',type:'video',dur:'22m'},{name:'Logistic Regression',type:'video',dur:'20m'},{name:'Decision Trees',type:'video',dur:'18m'},{name:'Predict House Prices',type:'code',dur:'45m'}]},{title:'Neural Networks',lessons:[{name:'Intro to Neural Nets',type:'video',dur:'25m'},{name:'TensorFlow/Keras',type:'video',dur:'30m'},{name:'CNN Project',type:'code',dur:'60m'}]},{title:'Unsupervised & NLP',lessons:[{name:'K-Means Clustering',type:'video',dur:'18m'},{name:'Intro to NLP',type:'video',dur:'22m'},{name:'Sentiment Analyser',type:'code',dur:'60m'}]}]},
  robotics:{id:'robotics',title:'Robotics with Kit',icon:'🦾',color:'#ec4899',level:'All Levels',weeks:8,price:5000,cat:['hardware'],tags:['Arduino','Sensors','Motors','IoT','Hardware Kit'],desc:'Build real robots! Kit shipped to you. Arduino, sensors, motors and autonomous systems.',longDesc:'The only course with physical hardware shipped to you. Build 3 robots.',features:['32 video lessons','3 robot builds','2 live classes/week','Hardware kit shipped','Community channel','Certificate'],modules:[{title:'Arduino Basics',lessons:[{name:'What is Arduino?',type:'video',dur:'12m'},{name:'IDE Setup & Blink',type:'video',dur:'14m'},{name:'Digital & Analog I/O',type:'video',dur:'16m'},{name:'LED Patterns',type:'code',dur:'25m'}]},{title:'Sensors & Motors',lessons:[{name:'Ultrasonic Sensor',type:'video',dur:'18m'},{name:'IR Sensors',type:'video',dur:'14m'},{name:'DC Motors & L298N',type:'video',dur:'20m'},{name:'Servo Motors',type:'video',dur:'16m'}]},{title:'Build Your Robots',lessons:[{name:'Line Follower Robot',type:'video',dur:'30m'},{name:'Obstacle Avoider',type:'video',dur:'28m'},{name:'Bluetooth Control',type:'video',dur:'25m'},{name:'Final Robot Project',type:'code',dur:'90m'}]}]}
};

const SUBSCRIPTION_PLANS = {
  free:{id:'free',name:'Free',price:0,period:'',color:'#7a9bb5',features:[{text:'Browse all 7 courses',yes:true},{text:'Purchase courses individually',yes:true},{text:'Basic progress tracking',yes:true},{text:'Online code editor',yes:false},{text:'Download ebooks (50+)',yes:false},{text:'Community channels',yes:false},{text:'Group projects (up to 4)',yes:false},{text:'Weekly competitions',yes:false},{text:'1-on-1 mentorship',yes:false}],cta:'Start Free'},
  basic:{id:'basic',name:'Basic',price:399,period:'/month',color:'#00c8ff',features:[{text:'Everything in Free',yes:true},{text:'Online code editor',yes:true},{text:'Download all ebooks (50+)',yes:true},{text:'Community channels',yes:true},{text:'Weekly leaderboard',yes:true},{text:'Group projects (up to 4)',yes:false},{text:'Weekly competitions',yes:false},{text:'1-on-1 mentorship',yes:false}],cta:'Get Basic'},
  pro:{id:'pro',name:'Pro',price:799,period:'/month',color:'#8b5cf6',popular:true,features:[{text:'Everything in Basic',yes:true},{text:'Group projects (up to 4)',yes:true},{text:'Weekly competitions',yes:true},{text:'Priority community support',yes:true},{text:'Live session recordings',yes:true},{text:'Exclusive Pro resources',yes:true},{text:'1-on-1 mentorship',yes:false}],cta:'Go Pro'},
  premium:{id:'premium',name:'Premium',price:1499,period:'/month',color:'#ffd700',features:[{text:'Everything in Pro',yes:true},{text:'1-on-1 mentorship sessions',yes:true},{text:'Direct WhatsApp support',yes:true},{text:'Resume & project review',yes:true},{text:'Placement assistance',yes:true},{text:'Earliest course access',yes:true},{text:'Certification fast-track',yes:true}],cta:'Go Premium'}
};

const PLAN_RANK     = { free:0, basic:1, pro:2, premium:3 };
const PLAN_FEATURES = { codeEditor:'basic', ebookDownload:'basic', community:'basic', groupProject:'pro', competitions:'pro', mentorship:'premium' };

// ══════════════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS — all wrapped in try/catch, never throw
// ══════════════════════════════════════════════════════════════════

async function getUserPlan(uid) {
  if (!uid || !db) return 'free';
  try {
    const snap = await db.collection('subscriptions').where('userId','==',uid).where('active','==',true).get();
    if (snap.empty) return 'free';
    let best = 'free';
    snap.forEach(doc => { const p=doc.data().planId; if((PLAN_RANK[p]||0)>(PLAN_RANK[best]||0)) best=p; });
    return best;
  } catch { return 'free'; }
}

async function getUserCourses(uid) {
  if (!uid || !db) return new Set();
  try {
    const snap = await db.collection('coursePurchases').where('userId','==',uid).where('status','==','active').get();
    return new Set(snap.docs.map(d=>d.data().courseId));
  } catch { return new Set(); }
}

async function hasCourse(uid, courseId) {
  if (!uid || !db) return false;
  try {
    const snap = await db.collection('coursePurchases').where('userId','==',uid).where('courseId','==',courseId).where('status','==','active').limit(1).get();
    return !snap.empty;
  } catch { return false; }
}

function hasPlanFeature(userPlan, feature) {
  const req = PLAN_FEATURES[feature]||'premium';
  return (PLAN_RANK[userPlan]||0) >= (PLAN_RANK[req]||0);
}

function formatPrice(amount) { return !amount ? 'Free' : '₹'+Number(amount).toLocaleString('en-IN'); }

function getGreeting(name) {
  const h=new Date().getHours(), g=h>=5&&h<12?'Good morning':h>=12&&h<17?'Good afternoon':h>=17&&h<22?'Good evening':'Hello';
  return name ? `${g}, ${name}` : g;
}

function getWeekKey() {
  const now=new Date(), jan1=new Date(now.getFullYear(),0,1);
  const week=Math.ceil(((now-jan1)/86400000+jan1.getDay()+1)/7);
  return `${now.getFullYear()}-W${String(week).padStart(2,'0')}`;
}

async function completeLesson(uid, courseId, lessonId, xp=10) {
  if (!uid || !db) return;
  try {
    const batch=db.batch();
    batch.set(db.collection('progress').doc(uid).collection('courses').doc(courseId).collection('lessons').doc(lessonId),{completed:true,completedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    batch.set(db.collection('users').doc(uid),{xp:firebase.firestore.FieldValue.increment(xp),lastSeen:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    await batch.commit();
    if (rtdb) rtdb.ref(`leaderboard/${getWeekKey()}/${uid}/xp`).transaction(v=>(v||0)+xp);
  } catch(e) { console.warn('completeLesson error:', e.message); }
}

async function awardPoints(uid, displayName, xp, reason='') {
  if (!uid || !rtdb) return;
  try {
    await rtdb.ref(`leaderboard/${getWeekKey()}/${uid}`).transaction(curr=>{
      if (!curr) return {xp,displayName,reason,lastUpdated:Date.now()};
      curr.xp=(curr.xp||0)+xp; curr.displayName=displayName; curr.lastUpdated=Date.now(); return curr;
    });
  } catch(e) { console.warn('awardPoints error:', e.message); }
}

function updatePresence(uid) {
  if (!uid || !rtdb) return;
  try {
    const ref=rtdb.ref(`presence/${uid}`);
    ref.set({online:true,lastSeen:firebase.database.ServerValue.TIMESTAMP});
    ref.onDisconnect().set({online:false,lastSeen:firebase.database.ServerValue.TIMESTAMP});
  } catch(e) { console.warn('updatePresence error:', e.message); }
}

async function isAdmin(user) {
  if (!user || !db) return false;
  try { const t=await user.getIdTokenResult(true); if(t.claims.admin) return true; } catch {}
  try { const d=await db.collection('users').doc(user.uid).get(); return !!(d.data()?.roles?.admin); } catch { return false; }
}

async function isOwner(user) {
  if (!user || !db) return false;
  try { const d=await db.collection('users').doc(user.uid).get(); return !!(d.data()?.roles?.owner); } catch { return false; }
}

async function grantCourseAccess(uid, courseId, amount, phone='', method='upi') {
  if (!db) return;
  const course=COURSES[courseId];
  const expiry=new Date(Date.now()+365*24*60*60*1000);
  try {
    await db.collection('coursePurchases').doc(`${uid}_${courseId}`).set({
      userId:uid,courseId,courseName:course?.title||courseId,amount,phone,method,
      status:'active',grantedAt:firebase.firestore.FieldValue.serverTimestamp(),expiresAt:expiry
    },{merge:true});
  } catch(e) { console.warn('grantCourseAccess error:', e.message); }
}

async function getCourseProgress(uid, courseId) {
  const course=COURSES[courseId]; if (!course || !db) return 0;
  const total=course.modules.reduce((a,m)=>a+m.lessons.length,0); if (!total) return 0;
  try {
    const snap=await db.collection('progress').doc(uid).collection('courses').doc(courseId).collection('lessons').where('completed','==',true).get();
    return Math.round((snap.size/total)*100);
  } catch { return 0; }
}
