// Shared fetch wrapper — always sends/receives JSON with session cookie
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, message: data.error || '發生錯誤' };
  return data;
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ── Nav: load user balance, highlight active link ─────────────
async function initNav() {
  const balanceEl = document.getElementById('nav-balance');
  const logoutBtn = document.getElementById('btn-logout');
  const menuBtn   = document.getElementById('btn-user-menu');
  const userMenu  = document.getElementById('user-menu');
  const navLinks  = document.querySelector('.nav-links');

  try {
    const user = await apiFetch('/api/me');
    if (balanceEl) {
      balanceEl.textContent = `💰 ${user.balance.toLocaleString()} 元`;
    }
    if (navLinks) {
      if (!navLinks.querySelector('a[href="/presentation.html"]')) {
        const pres = document.createElement('a');
        pres.href = '/presentation.html';
        pres.textContent = '網站簡介';
        pres.className = 'nav-pres';
        navLinks.appendChild(pres);
      }
      if (user.is_admin && !navLinks.querySelector('a[href="/admin.html"]')) {
        const admin = document.createElement('a');
        admin.href = '/admin.html';
        admin.textContent = '管理後台';
        admin.className = 'nav-admin';
        navLinks.appendChild(admin);
      }
    }
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await apiFetch('/api/auth/logout', { method: 'POST' });
        location.href = '/login.html';
      });
    }
    if (menuBtn && userMenu) {
      const closeMenu = () => {
        userMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      };

      menuBtn.addEventListener('click', e => {
        e.stopPropagation();
        const willOpen = !userMenu.classList.contains('open');
        userMenu.classList.toggle('open', willOpen);
        menuBtn.setAttribute('aria-expanded', String(willOpen));
      });

      userMenu.addEventListener('click', e => e.stopPropagation());
      document.addEventListener('click', closeMenu);
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMenu();
      });
    }
  } catch {
    // Not logged in — redirect to login for protected pages
    const pub = ['/login.html', '/register.html'];
    if (!pub.some(p => location.pathname.endsWith(p))) {
      location.href = '/login.html';
    }
  }

  const brand = document.querySelector('.nav-brand');
  const onHome = location.pathname.endsWith('/index.html')
    || location.pathname === '/' || location.pathname === '';
  if (brand && onHome) brand.classList.add('active');

  // Highlight active nav link
  const links = document.querySelectorAll('.nav-links a, .nav-menu-dropdown a');
  links.forEach(a => {
    if (a.getAttribute('href') && location.pathname.endsWith(a.getAttribute('href'))) {
      a.classList.add('active');
      if (a.closest('.nav-menu-dropdown') && menuBtn) {
        menuBtn.classList.add('active');
      }
    }
  });

  // Highlight balance pill when on wallet page
  const bal = document.getElementById('nav-balance');
  if (bal && location.pathname.endsWith('/wallet.html')) {
    bal.classList.add('active');
  }
}
