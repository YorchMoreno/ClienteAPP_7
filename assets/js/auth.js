/* ============================================
   ClienteAPP — Autenticación
   Usuarios en Supabase (nube) — datos en IndexedDB (local)
   ============================================ */

const SESSION_KEY = 'clienteapp_session';
let _loginAttempts = 0;
let _lockUntil = 0;

window.Auth = {

  // ── Hash SHA-256 ──────────────────────────────────────────────────────────
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data    = encoder.encode(password);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // ── Login — busca usuario en Supabase ─────────────────────────────────────
  async login(loginInput, password) {
    if (Date.now() < _lockUntil) {
      const segs = Math.ceil((_lockUntil - Date.now()) / 1000);
      throw new Error(`Demasiados intentos. Espera ${segs} segundos.`);
    }

    const hashed = await this.hashPassword(password);

    // Buscar usuario en Supabase
    let user = await SupabaseUsers.findByLogin(loginInput.trim());

    // Fallback: buscar en IndexedDB local (por si acaso)
    if (!user) {
      const locales = await DB.getAll(DB.STORES.usuarios);
      user = locales.find(u => u.login === loginInput.trim() && u.activo !== false) || null;
    }

    if (!user || user.activo === false) {
      this._falloLogin();
      throw new Error(this._mensajeError());
    }

    // Verificar contraseña (SHA-256 o legacy Base64)
    const isLegacy = user.password && user.password.length < 50;
    const ok = isLegacy
      ? user.password === btoa(password)
      : user.password === hashed;

    if (!ok) {
      this._falloLogin();
      throw new Error(this._mensajeError());
    }

    // Migrar legacy → SHA-256
    if (isLegacy) {
      user.password = hashed;
      await SupabaseUsers.put(user);
    }

    // ── Sesión única: bloquear si ya hay otra sesión activa ───────────────
    // (no aplica al superadmin para que siempre pueda entrar)
    if (user.rol !== 'superadmin') {
      const yaActivo = await SupabaseUsers.tieneSesionActiva(user.id);
      if (yaActivo) {
        throw new Error(
          `⚠️ "${user.login}" ya tiene una sesión activa en otro dispositivo. ` +
          `Cierra sesión allí primero. Si crees que es un error, espera 8 horas ` +
          `o contacta al administrador para que la libere.`
        );
      }
    }

    _loginAttempts = 0;
    _lockUntil = 0;

    // Registrar token de sesión en Supabase
    const sessionToken = await SupabaseUsers.registrarSesion(user.id);

    const session = {
      id:           user.id,
      nombre:       user.nombre,
      login:        user.login,
      rol:          user.rol,
      loginTime:    new Date().toISOString(),
      sessionToken  // guardamos el token para verificaciones futuras
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

    // Registrar presencia en línea
    const presencia = JSON.parse(localStorage.getItem('clienteapp_presencia') || '{}');
    presencia[user.id] = { nombre: user.nombre, login: user.login, desde: new Date().toISOString() };
    localStorage.setItem('clienteapp_presencia', JSON.stringify(presencia));

    return session;
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logout() {
    const session = this.getSession();
    if (session?.id) {
      // Limpiar token de sesión en Supabase (esperamos a que termine antes de recargar)
      SupabaseUsers.cerrarSesion(session.id).finally(() => {
        const presencia = JSON.parse(localStorage.getItem('clienteapp_presencia') || '{}');
        delete presencia[session.id];
        localStorage.setItem('clienteapp_presencia', JSON.stringify(presencia));
        sessionStorage.removeItem(SESSION_KEY);
        location.reload();
      });
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      location.reload();
    }
  },

  // ── Sesión actual ─────────────────────────────────────────────────────────
  getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  isAuthenticated() { return !!this.getSession(); },

  hasRole(...roles) {
    const s = this.getSession();
    return s && roles.includes(s.rol);
  },

  isAdmin()      { return this.hasRole('admin', 'superadmin'); },
  isSuperAdmin() { return this.hasRole('superadmin'); },

  getRoleName(rol) {
    const names = {
      superadmin: 'Super Administrador',
      admin:      'Administrador',
      asesor:     'Asesor de Ventas',
      tecnico:    'Técnico de Obra'
    };
    return names[rol] || rol;
  },

  // ── Helpers internos ──────────────────────────────────────────────────────
  _falloLogin() {
    _loginAttempts++;
    if (_loginAttempts >= 5) {
      _lockUntil = Date.now() + 30000;
      _loginAttempts = 0;
    }
  },

  _mensajeError() {
    if (Date.now() < _lockUntil) {
      return 'Demasiados intentos fallidos. Bloqueado 30 segundos.';
    }
    const r = 5 - _loginAttempts;
    return `Usuario o contraseña incorrectos. ${r} intento${r !== 1 ? 's' : ''} restante${r !== 1 ? 's' : ''}.`;
  }
};
