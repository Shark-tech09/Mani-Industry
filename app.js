// app.js — Mani Industries v2.0 — Shared bootstrap for all pages

// ── AUTH STATE ────────────────────────────────────────────────────
auth.onAuthStateChanged(async user => {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  window._currentUser = user;

  if (user) {
    window._currentUserPlan = await getUserPlan(user.uid);
    // Keep last-seen updated
    db.collection('users').doc(user.uid).set({ lastSeen:firebase.firestore.FieldValue.serverTimestamp() },{merge:true}).catch(()=>{});
    // Update nav chip if on homepage
    if (typeof updateNavForLoggedInUser==='function') updateNavForLoggedInUser(user);
  } else {
    window._currentUserPlan = 'free';
    const protected_ = ['dashboard.html','lesson.html','course-page.html','profile.html'];
    if (protected_.includes(page)) window.location.href = 'index.html';
    if (typeof updateNavForLoggedOutUser==='function') updateNavForLoggedOutUser();
  }
});

// ── THEME ─────────────────────────────────────────────────────────
(function initTheme(){
  const saved = localStorage.getItem('mi_theme') || 'blue';
  document.body.dataset.theme = saved;
  document.querySelectorAll('.theme-option').forEach(b => b.classList.toggle('active', b.dataset.theme===saved));
})();

document.addEventListener('click', e => {
  const btn = e.target.closest('.theme-option');
  if (!btn?.dataset.theme) return;
  const t = btn.dataset.theme;
  document.body.dataset.theme = t;
  localStorage.setItem('mi_theme', t);
  document.querySelectorAll('.theme-option').forEach(b => b.classList.toggle('active', b===btn));
  document.getElementById('themeDropdown')?.classList.remove('open');
  if (window._currentUser) {
    db.collection('users').doc(window._currentUser.uid).update({'preferences.theme':t}).catch(()=>{});
  }
});

document.getElementById('themeBtn')?.addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('themeDropdown')?.classList.toggle('open');
});
document.addEventListener('click', () => document.getElementById('themeDropdown')?.classList.remove('open'));

// ── TOAST ─────────────────────────────────────────────────────────
window.showToast = function(msg, type='info') {
  const colors = {info:'var(--accent)',success:'#00ff88',error:'#ff3366',warn:'#ffd700'};
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:2rem;right:2rem;z-index:9999;background:var(--bg3);border:1px solid ${colors[type]||'var(--accent)'};color:var(--text);padding:1rem 1.5rem;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:.95rem;box-shadow:0 10px 40px rgba(0,0,0,.4);animation:fadeUp .3s ease;max-width:320px;line-height:1.4`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.transition='opacity .4s'; t.style.opacity='0'; setTimeout(()=>t.remove(),400); }, 3500);
};

// ── SCROLL NAV SHADOW ─────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.style.boxShadow = window.scrollY>50 ? '0 4px 30px rgba(0,0,0,.4)' : 'none';
});

// ── HAMBURGER ─────────────────────────────────────────────────────
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('mobileMenu')?.classList.toggle('open');
});
window.closeMobileMenu = () => document.getElementById('mobileMenu')?.classList.remove('open');

// ── NOTIFICATION PANEL ────────────────────────────────────────────
document.getElementById('notifBtn')?.addEventListener('click', e => {
  e.stopPropagation();
  const p = document.getElementById('notifPanel');
  if (p) p.style.display = p.style.display==='none'?'block':'none';
});
document.addEventListener('click', e => {
  const p=document.getElementById('notifPanel'), b=document.getElementById('notifBtn');
  if (p&&b&&!p.contains(e.target)&&!b.contains(e.target)) p.style.display='none';
});

// ── SMOOTH SCROLL ─────────────────────────────────────────────────
window.smoothScroll = id => { document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); };
