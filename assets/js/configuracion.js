/* ============================================
   ClienteAPP — Módulo de Configuración
   ============================================ */

window.Configuracion = {

  async render() {
    const content = document.getElementById('pageContent');
    const session = Auth.getSession();

    // Leer nombre personalizado guardado (tiene prioridad sobre la sesión)
    const nombreGuardado = localStorage.getItem('clienteapp_nombre_display') || session?.nombre || 'George';

    // Calcular uso de almacenamiento estimado
    let storageInfo = 'Calculando...';
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const usedMB  = (est.usage  / 1024 / 1024).toFixed(1);
        const quotaMB = (est.quota  / 1024 / 1024).toFixed(0);
        storageInfo = `${usedMB} MB usados de ${quotaMB} MB`;
      } else {
        storageInfo = 'Almacenamiento local del equipo';
      }
    } catch { storageInfo = 'Almacenamiento local del equipo'; }

    content.innerHTML = `
      <div class="fade-in">

        <!-- Hero configuración -->
        <div class="cfg-hero mb-4">
          <div class="d-flex align-items-center gap-4">
            <div class="cfg-avatar">
              <i class="bi bi-person-fill fs-2"></i>
            </div>
            <div>
              <h3 class="fw-bold text-white mb-1" id="cfgNombreHero">${nombreGuardado}</h3>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <span class="hero-pill">
                  <i class="bi bi-shield-fill-check me-1"></i>${Auth.getRoleName(session?.rol || 'admin')}
                </span>
                <span class="hero-pill"><i class="bi bi-hdd-fill me-1"></i>Almacenamiento Local</span>
                <span class="hero-pill ${navigator.onLine ? '' : 'hero-pill-warn'}">
                  <i class="bi bi-${navigator.onLine ? 'wifi' : 'wifi-off'} me-1"></i>
                  ${navigator.onLine ? 'En línea' : 'Sin conexión'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">

          <!-- ── Columna izquierda: Perfil + Contraseña ── -->
          <div class="col-lg-5">
            <div class="d-flex flex-column gap-4">

              <!-- Cambiar nombre -->
              <div class="card border-0 shadow-sm" style="border-radius:16px;overflow:hidden;">
                <div class="card-header border-0 py-3 px-4"
                     style="background:linear-gradient(135deg,#1a4a2e,#2d8a4f);">
                  <h6 class="fw-bold mb-0 text-white">
                    <i class="bi bi-person-gear me-2"></i>Mi Perfil
                  </h6>
                </div>
                <div class="card-body p-4">
                  <div class="mb-3">
                    <label class="form-label fw-semibold small text-uppercase text-muted">
                      Nombre para mostrar
                    </label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="bi bi-person text-muted"></i>
                      </span>
                      <input type="text" class="form-control border-start-0 ps-1"
                             id="inputNombreDisplay"
                             value="${nombreGuardado}"
                             placeholder="Tu nombre"
                             maxlength="40" />
                    </div>
                    <div class="form-text text-muted mt-1">
                      <i class="bi bi-info-circle me-1"></i>
                      Aparece en el sidebar, dashboard y saludo de bienvenida.
                    </div>
                  </div>
                  <button class="btn btn-success w-100 py-2 fw-semibold"
                          onclick="Configuracion.guardarNombre()">
                    <i class="bi bi-check-circle me-2"></i>Guardar Nombre
                  </button>
                </div>
              </div>

              <!-- Cambiar contraseña -->
              <div class="card border-0 shadow-sm" style="border-radius:16px;overflow:hidden;">
                <div class="card-header border-0 py-3 px-4"
                     style="background:linear-gradient(135deg,#1a3c5e,#2d6a9f);">
                  <h6 class="fw-bold mb-0 text-white">
                    <i class="bi bi-shield-lock me-2"></i>Cambiar Contraseña
                  </h6>
                </div>
                <div class="card-body p-4">
                  <div class="mb-3">
                    <label class="form-label fw-semibold small text-uppercase text-muted">Contraseña actual</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="bi bi-lock text-muted"></i>
                      </span>
                      <input type="password" class="form-control border-start-0 ps-1"
                             id="passActual" placeholder="••••••••" />
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-semibold small text-uppercase text-muted">Nueva contraseña</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="bi bi-key text-muted"></i>
                      </span>
                      <input type="password" class="form-control border-start-0 ps-1"
                             id="passNueva" placeholder="Mínimo 6 caracteres" />
                    </div>
                  </div>
                  <div class="mb-4">
                    <label class="form-label fw-semibold small text-uppercase text-muted">Confirmar contraseña</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="bi bi-key-fill text-muted"></i>
                      </span>
                      <input type="password" class="form-control border-start-0 ps-1"
                             id="passConfirm" placeholder="Repite la nueva contraseña" />
                    </div>
                  </div>
                  <button class="btn btn-primary w-100 py-2 fw-semibold"
                          onclick="Configuracion.cambiarPassword()">
                    <i class="bi bi-check-circle me-2"></i>Actualizar Contraseña
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- ── Columna derecha ── -->
          <div class="col-lg-7">
            <div class="row g-4">

              <!-- Gestión de usuarios (solo superadmin) -->
              ${Auth.isSuperAdmin() ? `
              <div class="col-12">
                <div class="card border-0 shadow-sm" style="border-radius:16px;overflow:hidden;">
                  <div class="card-header border-0 py-3 px-4"
                       style="background:linear-gradient(135deg,#2d1a4a,#5a2d8a);">
                    <div class="d-flex align-items-center justify-content-between">
                      <h6 class="fw-bold mb-0 text-white">
                        <i class="bi bi-people-fill me-2"></i>Gestión de Usuarios
                      </h6>
                      <button class="btn btn-sm fw-bold"
                              style="background:white;color:#5a2d8a;border:none;border-radius:8px;padding:5px 14px;"
                              onclick="Configuracion.abrirModalUsuario()">
                        <i class="bi bi-person-plus me-1"></i>+ Nuevo usuario
                      </button>
                    </div>
                  </div>
                  <div class="card-body p-0" id="listaUsuarios">
                    ${await this._renderUsuarios()}
                  </div>
                </div>
              </div>` : ''}

              <!-- Info del sistema -->
              <div class="col-12">
                <div class="card border-0 shadow-sm" style="border-radius:16px;overflow:hidden;">
                  <div class="card-header border-0 py-3 px-4"
                       style="background:linear-gradient(135deg,#0f1f30,#1a3c5e);">
                    <h6 class="fw-bold mb-0 text-white">
                      <i class="bi bi-cpu me-2"></i>Sistema e Información
                    </h6>
                  </div>
                  <div class="card-body p-0">
                    <div class="list-group list-group-flush">
                      ${this._infoRow('bi-app', 'Aplicación', 'ClienteAPP v1.0.0', 'text')}
                      ${this._infoRow('bi-person-badge', 'Usuario', nombreGuardado, 'badge-primary')}
                      ${this._infoRow('bi-hdd-fill', 'Almacenamiento', 'Tu computador (Local)', 'badge-success')}
                      ${this._infoRow('bi-database', 'Motor de datos', 'IndexedDB — Sin servidor', 'badge-info')}
                      ${this._infoRow('bi-pie-chart', 'Espacio usado', storageInfo, 'text')}
                      ${this._infoRow('bi-broadcast', 'Modo', 'Offline-First PWA', 'badge-purple')}
                      ${this._infoRow('bi-wifi', 'Conexión',
                          navigator.onLine ? 'En línea' : 'Sin conexión',
                          navigator.onLine ? 'badge-success' : 'badge-warning')}
                    </div>
                  </div>
                </div>
              </div>

                  <!-- Créditos del desarrollador -->
                  <div class="col-12">
                    <div class="card border-0 shadow-sm" style="border-radius:16px;overflow:hidden;">
                      <div class="card-body p-4">
                        <div class="d-flex align-items-center gap-3">
                          <div style="width:52px;height:52px;border-radius:14px;flex-shrink:0;
                                      background:linear-gradient(135deg,#0f1f30,#2d6a9f);
                                      display:flex;align-items:center;justify-content:center;">
                            <i class="bi bi-code-slash text-white fs-4"></i>
                          </div>
                          <div>
                            <div class="fw-bold" style="font-size:15px;">George Moreno</div>
                            <div class="text-muted small">Ingeniero de Sistemas</div>
                            <div class="text-muted small">
                              <i class="bi bi-building me-1"></i>GioTech Ingeniería
                            </div>
                          </div>
                        </div>
                        <div class="mt-3 pt-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
                          <small class="text-muted">
                            <i class="bi bi-c-circle me-1"></i>2026 GioTech Ingeniería — Todos los derechos reservados
                          </small>
                          <a href="https://wa.me/573502837223?text=Hola%20George%2C%20te%20contacto%20por%20ClienteAPP"
                             target="_blank"
                             class="btn btn-sm fw-semibold"
                             style="background:#25d366;color:white;border:none;border-radius:8px;">
                            <i class="bi bi-whatsapp me-1"></i>3502837223
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

              <!-- Personalización de opciones -->
              <div class="col-12">
                <div class="card border-0 shadow-sm" style="border-radius:16px;overflow:hidden;">
                  <div class="card-header border-0 py-3 px-4"
                       style="background:linear-gradient(135deg,#1a3a4a,#2d6a8a);">
                    <h6 class="fw-bold mb-0 text-white">
                      <i class="bi bi-sliders me-2"></i>Personalización
                    </h6>
                  </div>
                  <div class="card-body p-4">
                    ${this._renderPersonalizacion()}
                  </div>
                </div>
              </div>

              <!-- Gestión de datos -->
              <div class="col-12">
                <div class="card border-0 shadow-sm" style="border-radius:16px;overflow:hidden;">
                  <div class="card-header border-0 py-3 px-4"
                       style="background:linear-gradient(135deg,#4a3a1a,#8a6a2d);">
                    <h6 class="fw-bold mb-0 text-white">
                      <i class="bi bi-database-gear me-2"></i>Gestión de Datos
                    </h6>
                  </div>
                  <div class="card-body p-4">
                    <div class="row g-3">
                      <div class="col-sm-4">
                        <button class="btn btn-outline-primary w-100 py-3 d-flex flex-column align-items-center gap-1"
                                style="border-radius:12px;"
                                onclick="Configuracion.exportarDatos()">
                          <i class="bi bi-download fs-3"></i>
                          <span class="fw-semibold small">Exportar</span>
                          <span class="text-muted" style="font-size:10px;">Backup JSON</span>
                        </button>
                      </div>
                      <div class="col-sm-4">
                        <button class="btn btn-outline-warning w-100 py-3 d-flex flex-column align-items-center gap-1"
                                style="border-radius:12px;"
                                onclick="document.getElementById('importFile').click()">
                          <i class="bi bi-upload fs-3"></i>
                          <span class="fw-semibold small">Importar</span>
                          <span class="text-muted" style="font-size:10px;">Restaurar backup</span>
                        </button>
                        <input type="file" id="importFile" accept=".json" class="d-none"
                               onchange="Configuracion.importarDatos(this)" />
                      </div>
                      <div class="col-sm-4">
                        <button class="btn btn-outline-danger w-100 py-3 d-flex flex-column align-items-center gap-1"
                                style="border-radius:12px;"
                                onclick="Configuracion.limpiarDatos()">
                          <i class="bi bi-trash3 fs-3"></i>
                          <span class="fw-semibold small">Limpiar</span>
                          <span class="text-muted" style="font-size:10px;">Borrar todo</span>
                        </button>
                      </div>
                    </div>
                    <div class="alert alert-info py-2 px-3 mt-3 mb-0 small d-flex align-items-center gap-2">
                      <i class="bi bi-info-circle-fill flex-shrink-0"></i>
                      <span>Los datos se guardan en <strong>tu computador</strong>.
                      Exporta un backup regularmente para no perder información.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>`;
  },

  // ── Renderizar sección de personalización ────────────────────────────────
  _renderPersonalizacion() {
    const op = Opciones.get();

    const renderLista = (key, label, icon, items) => `
      <div class="mb-4">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <label class="fw-semibold small text-uppercase text-muted">
            <i class="bi ${icon} me-1"></i>${label}
          </label>
        </div>
        <div class="d-flex flex-wrap gap-2 mb-2" id="lista_${key}">
          ${items.map((item, i) => `
            <span class="badge d-flex align-items-center gap-1 px-2 py-1"
                  style="background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;
                         border-radius:8px;font-size:12px;font-weight:500;">
              ${item}
              <button type="button" onclick="Configuracion.eliminarOpcion('${key}', ${i})"
                      style="background:none;border:none;color:#ef4444;padding:0;
                             line-height:1;cursor:pointer;font-size:13px;"
                      title="Eliminar">×</button>
            </span>`).join('')}
        </div>
        <div class="input-group input-group-sm">
          <input type="text" class="form-control" id="nuevo_${key}"
                 placeholder="Agregar nuevo..." maxlength="60"
                 onkeydown="if(event.key==='Enter'){Configuracion.agregarOpcion('${key}');}" />
          <button class="btn btn-outline-primary" type="button"
                  onclick="Configuracion.agregarOpcion('${key}')">
            <i class="bi bi-plus-lg"></i>
          </button>
        </div>
      </div>`;

    return `
      <!-- Comisión -->
      <div class="mb-4 p-3 rounded-3" style="background:#f0fdf4;border:1.5px solid #bbf7d0;">
        <label class="fw-semibold small text-uppercase text-muted d-block mb-2">
          <i class="bi bi-percent me-1"></i>Porcentaje de Comisión
        </label>
        <div class="d-flex align-items-center gap-3">
          <div class="input-group input-group-sm" style="max-width:140px;">
            <input type="number" class="form-control" id="cfg_comisionPct"
                   value="${op.comisionPct}" min="0" max="100" step="0.5" />
            <span class="input-group-text">%</span>
          </div>
          <button class="btn btn-sm btn-success fw-semibold"
                  onclick="Configuracion.guardarComisionPct()">
            <i class="bi bi-check-circle me-1"></i>Guardar
          </button>
        </div>
      </div>

      ${renderLista('sistemas',     'Sistemas Constructivos', 'bi-bricks',       op.sistemas)}
      ${renderLista('cubiertas',    'Tipos de Cubierta',      'bi-house-fill',   op.cubiertas)}
      ${renderLista('ornSistemas',  'Sistemas de Ornamentación','bi-grid-3x3-gap',op.ornSistemas)}
      ${renderLista('ornColores',   'Colores de Ornamentación','bi-palette',     op.ornColores)}
      ${renderLista('puertaChapas', 'Tipos de Chapa/Pomo',    'bi-door-open',    op.puertaChapas)}

      <div class="alert alert-info py-2 small mb-0">
        <i class="bi bi-info-circle me-1"></i>
        Los cambios se aplican inmediatamente al abrir el modal de proyecto.
      </div>`;
  },

  // ── Agregar opción a una lista ────────────────────────────────────────────
  agregarOpcion(key) {
    const input = document.getElementById(`nuevo_${key}`);
    const valor = input?.value?.trim();
    if (!valor) { UI.toast('Escribe un valor primero', 'warning'); return; }

    const op = Opciones.get();
    if (!op[key]) op[key] = [];
    if (op[key].includes(valor)) {
      UI.toast('Ese valor ya existe', 'warning'); return;
    }

    op[key].push(valor);
    Opciones.save(op);
    input.value = '';

    // Refrescar solo la lista visual
    const lista = document.getElementById(`lista_${key}`);
    if (lista) {
      lista.innerHTML = op[key].map((item, i) => `
        <span class="badge d-flex align-items-center gap-1 px-2 py-1"
              style="background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;
                     border-radius:8px;font-size:12px;font-weight:500;">
          ${item}
          <button type="button" onclick="Configuracion.eliminarOpcion('${key}', ${i})"
                  style="background:none;border:none;color:#ef4444;padding:0;
                         line-height:1;cursor:pointer;font-size:13px;"
                  title="Eliminar">×</button>
        </span>`).join('');
    }
    UI.toast(`"${valor}" agregado`, 'success');
  },

  // ── Eliminar opción de una lista ──────────────────────────────────────────
  async eliminarOpcion(key, index) {
    const op = Opciones.get();
    if (!op[key] || op[key].length <= 1) {
      UI.toast('Debe quedar al menos una opción', 'warning'); return;
    }

    const valor = op[key][index];
    const ok = await UI.confirm(`¿Eliminar "${valor}"?`, 'Eliminar opción');
    if (!ok) return;

    op[key].splice(index, 1);
    Opciones.save(op);

    // Refrescar lista
    const lista = document.getElementById(`lista_${key}`);
    if (lista) {
      lista.innerHTML = op[key].map((item, i) => `
        <span class="badge d-flex align-items-center gap-1 px-2 py-1"
              style="background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;
                     border-radius:8px;font-size:12px;font-weight:500;">
          ${item}
          <button type="button" onclick="Configuracion.eliminarOpcion('${key}', ${i})"
                  style="background:none;border:none;color:#ef4444;padding:0;
                         line-height:1;cursor:pointer;font-size:13px;"
                  title="Eliminar">×</button>
        </span>`).join('');
    }
    UI.toast(`"${valor}" eliminado`, 'danger');
  },

  // ── Guardar porcentaje de comisión ────────────────────────────────────────
  guardarComisionPct() {
    const val = parseFloat(document.getElementById('cfg_comisionPct')?.value);
    if (isNaN(val) || val < 0 || val > 100) {
      UI.toast('Ingresa un porcentaje válido entre 0 y 100', 'warning'); return;
    }
    const op = Opciones.get();
    op.comisionPct = val;
    Opciones.save(op);
    UI.toast(`Comisión actualizada a ${val}%`, 'success');
  },

  // ── Fila de info ──────────────────────────────────────────────────────────
  _infoRow(icon, label, value, type) {
    let valHtml;
    if (type === 'text') {
      valHtml = `<span class="fw-semibold small">${value}</span>`;
    } else if (type === 'badge-primary') {
      valHtml = `<span class="badge bg-primary">${value}</span>`;
    } else if (type === 'badge-success') {
      valHtml = `<span class="badge bg-success">${value}</span>`;
    } else if (type === 'badge-info') {
      valHtml = `<span class="badge bg-info text-dark">${value}</span>`;
    } else if (type === 'badge-warning') {
      valHtml = `<span class="badge bg-warning text-dark">${value}</span>`;
    } else if (type === 'badge-purple') {
      valHtml = `<span class="badge" style="background:#8e44ad;">${value}</span>`;
    } else {
      valHtml = `<span class="fw-semibold small">${value}</span>`;
    }
    return `
      <li class="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
        <span class="text-muted small d-flex align-items-center gap-2">
          <i class="bi ${icon}"></i>${label}
        </span>
        ${valHtml}
      </li>`;
  },

  // ── Guardar nombre para mostrar ──────────────────────────────────────────
  guardarNombre() {
    const input = document.getElementById('inputNombreDisplay');
    const nombre = input?.value?.trim();

    if (!nombre) {
      UI.toast('El nombre no puede estar vacío', 'warning');
      return;
    }
    if (nombre.length < 2) {
      UI.toast('El nombre debe tener al menos 2 caracteres', 'warning');
      return;
    }

    // Guardar en localStorage para que persista entre sesiones
    localStorage.setItem('clienteapp_nombre_display', nombre);

    // Actualizar en tiempo real: sidebar, avatar y hero
    const sidebarName = document.getElementById('sidebarUserName');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const cfgHero = document.getElementById('cfgNombreHero');

    if (sidebarName)   sidebarName.textContent  = nombre;
    if (sidebarAvatar) sidebarAvatar.textContent = UI.initials(nombre);
    if (cfgHero)       cfgHero.textContent       = nombre;

    // Animación de confirmación en el input
    if (input) {
      input.style.borderColor = '#10b981';
      input.style.boxShadow   = '0 0 0 3px rgba(16,185,129,0.15)';
      setTimeout(() => {
        input.style.borderColor = '';
        input.style.boxShadow   = '';
      }, 2000);
    }

    UI.toast(`Nombre actualizado a "${nombre}"`, 'success');
  },

  // ── Cambiar contraseña ────────────────────────────────────────────────────
  async cambiarPassword() {
    const actual   = document.getElementById('passActual').value;
    const nueva    = document.getElementById('passNueva').value;
    const confirma = document.getElementById('passConfirm').value;

    if (!actual || !nueva || !confirma) {
      UI.toast('Completa todos los campos', 'warning'); return;
    }
    if (nueva.length < 6) {
      UI.toast('La nueva contraseña debe tener al menos 6 caracteres', 'warning'); return;
    }
    if (nueva !== confirma) {
      UI.toast('Las contraseñas no coinciden', 'danger'); return;
    }

    const session = Auth.getSession();
    const usuario = await SupabaseUsers.get(session.id);

    // Verificar contraseña actual
    const hashedActual = await Auth.hashPassword(actual);
    const isLegacy     = usuario && usuario.password && usuario.password.length < 50;
    const passwordOk   = isLegacy
      ? usuario.password === btoa(actual)
      : usuario.password === hashedActual;

    if (!usuario || !passwordOk) {
      UI.toast('La contraseña actual es incorrecta', 'danger'); return;
    }

    usuario.password = await Auth.hashPassword(nueva);
    await SupabaseUsers.put(usuario);

    document.getElementById('passActual').value  = '';
    document.getElementById('passNueva').value   = '';
    document.getElementById('passConfirm').value = '';
    UI.toast('Contraseña actualizada correctamente', 'success');
  },

  // ── Renderizar lista de usuarios ─────────────────────────────────────────
  async _renderUsuarios() {
    const session  = Auth.getSession();
    const usuarios = await SupabaseUsers.getAll();
    const otros    = usuarios.filter(u => u.id !== session.id);

    // Leer presencia en línea
    const presencia = JSON.parse(localStorage.getItem('clienteapp_presencia') || '{}');

    if (otros.length === 0) {
      return `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-people fs-2 d-block mb-2 opacity-40"></i>
          <div class="small fw-semibold">No hay usuarios adicionales</div>
          <div style="font-size:12px;">Usa el botón <strong>+ Nuevo usuario</strong> para crear uno</div>
        </div>`;
    }

    return otros.map(u => {
      const enLinea  = !!presencia[u.id];
      const desde    = enLinea ? presencia[u.id].desde : null;
      const tiempoConectado = desde
        ? UI.timeAgo(desde)
        : null;

      return `
        <div class="d-flex align-items-center gap-3 px-4 py-3 border-bottom"
             style="transition:background 0.15s;">
          <!-- Avatar con indicador de presencia -->
          <div style="position:relative;flex-shrink:0;">
            <div class="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
                 style="width:42px;height:42px;font-size:14px;
                        background:${u.activo ? 'linear-gradient(135deg,#5a2d8a,#8e44ad)' : '#94a3b8'};">
              ${UI.initials(u.nombre)}
            </div>
            <!-- Punto de presencia -->
            <div style="position:absolute;bottom:1px;right:1px;
                        width:11px;height:11px;border-radius:50%;
                        background:${enLinea ? '#10b981' : '#94a3b8'};
                        border:2px solid white;
                        box-shadow:${enLinea ? '0 0 6px rgba(16,185,129,0.6)' : 'none'};">
            </div>
          </div>

          <div class="flex-grow-1 min-w-0">
            <div class="d-flex align-items-center gap-2">
              <span class="fw-semibold small">${u.nombre}</span>
              ${enLinea
                ? `<span style="background:#d1fae5;color:#065f46;border-radius:20px;
                               padding:1px 8px;font-size:10px;font-weight:700;">
                     🟢 En línea
                   </span>`
                : `<span style="background:#f1f5f9;color:#64748b;border-radius:20px;
                               padding:1px 8px;font-size:10px;font-weight:600;">
                     ⚫ Desconectado
                   </span>`}
            </div>
            <div class="text-muted" style="font-size:11px;">
              <i class="bi bi-person me-1"></i>${u.login}
              &nbsp;·&nbsp;
              <i class="bi bi-shield me-1"></i>${Auth.getRoleName(u.rol)}
              ${enLinea && tiempoConectado
                ? `&nbsp;·&nbsp;<i class="bi bi-clock me-1"></i>Conectado ${tiempoConectado}`
                : ''}
            </div>
          </div>

          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <span class="badge ${u.activo ? 'bg-success' : 'bg-secondary'}" style="font-size:10px;">
              ${u.activo ? 'Activo' : 'Desactivado'}
            </span>
            <button class="btn btn-sm btn-outline-secondary py-0 px-2"
                    title="${u.activo ? 'Desactivar' : 'Activar'} usuario"
                    onclick="Configuracion.toggleUsuario('${u.id}')">
              <i class="bi bi-${u.activo ? 'pause-circle' : 'play-circle'}" style="font-size:14px;"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning py-0 px-2"
                    title="Liberar sesión bloqueada"
                    onclick="Configuracion.liberarSesion('${u.id}', '${u.nombre}')">
              <i class="bi bi-unlock" style="font-size:14px;"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger py-0 px-2"
                    title="Eliminar usuario"
                    onclick="Configuracion.eliminarUsuario('${u.id}', '${u.nombre}')">
              <i class="bi bi-trash" style="font-size:14px;"></i>
            </button>
          </div>
        </div>`;
    }).join('');
  },

  // ── Abrir modal nuevo usuario ─────────────────────────────────────────────
  abrirModalUsuario() {
    document.getElementById('nuevoUsuarioNombre').value   = '';
    document.getElementById('nuevoUsuarioLogin').value    = '';
    document.getElementById('nuevoUsuarioPass').value     = '';
    document.getElementById('nuevoUsuarioConfirm').value  = '';
    UI.openModal('modalNuevoUsuario');
  },

  // ── Guardar nuevo usuario ─────────────────────────────────────────────────
  async guardarNuevoUsuario() {
    const nombre  = document.getElementById('nuevoUsuarioNombre').value.trim();
    const login   = document.getElementById('nuevoUsuarioLogin').value.trim().toLowerCase();
    const pass    = document.getElementById('nuevoUsuarioPass').value;
    const confirm = document.getElementById('nuevoUsuarioConfirm').value;

    if (!nombre || !login || !pass || !confirm) {
      UI.toast('Completa todos los campos', 'warning'); return;
    }
    if (pass.length < 6) {
      UI.toast('La contraseña debe tener al menos 6 caracteres', 'warning'); return;
    }
    if (pass !== confirm) {
      UI.toast('Las contraseñas no coinciden', 'danger'); return;
    }

    // Verificar que el login no exista
    const usuarios = await SupabaseUsers.getAll();
    if (usuarios.find(u => u.login === login)) {
      UI.toast(`El usuario "${login}" ya existe`, 'danger'); return;
    }

    await SupabaseUsers.put({
      id:       SupabaseUsers._uuid(),
      nombre,
      login,
      password: await Auth.hashPassword(pass),
      rol:      'admin',
      activo:   true
    });

    UI.closeModal('modalNuevoUsuario');
    UI.toast(`Usuario "${nombre}" creado correctamente`, 'success');

    // Refrescar lista
    const lista = document.getElementById('listaUsuarios');
    if (lista) lista.innerHTML = await this._renderUsuarios();
  },

  // ── Liberar sesión bloqueada ──────────────────────────────────────────────
  async liberarSesion(id, nombre) {
    await SupabaseUsers.cerrarSesion(id);
    UI.toast(`Sesión de "${nombre}" liberada — ya puede volver a ingresar`, 'success');
    const lista = document.getElementById('listaUsuarios');
    if (lista) lista.innerHTML = await this._renderUsuarios();
  },

  // ── Activar / Desactivar usuario ──────────────────────────────────────────
  async toggleUsuario(id) {
    const usuario = await SupabaseUsers.get(id);
    if (!usuario) return;

    usuario.activo = !usuario.activo;
    await SupabaseUsers.put(usuario);

    const accion = usuario.activo ? 'activado' : 'desactivado';
    UI.toast(`Usuario "${usuario.nombre}" ${accion}`, usuario.activo ? 'success' : 'warning');

    // Refrescar lista
    const lista = document.getElementById('listaUsuarios');
    if (lista) lista.innerHTML = await this._renderUsuarios();
  },

  // ── Eliminar usuario ──────────────────────────────────────────────────────
  async eliminarUsuario(id, nombre) {
    const ok = await UI.confirm(
      `¿Eliminar al usuario <strong>${nombre}</strong>? Esta acción no se puede deshacer.`,
      'Eliminar Usuario'
    );
    if (!ok) return;

    await SupabaseUsers.delete(id);
    UI.toast(`Usuario "${nombre}" eliminado`, 'danger');

    // Refrescar lista
    const lista = document.getElementById('listaUsuarios');
    if (lista) lista.innerHTML = await this._renderUsuarios();
  },

  // ── Exportar datos ────────────────────────────────────────────────────────
  async exportarDatos() {
    const [clientes, proyectos, pagos, seguimientos, finanzas] = await Promise.all([
      DB.getAll(DB.STORES.clientes),
      DB.getAll(DB.STORES.proyectos),
      DB.getAll(DB.STORES.pagos),
      DB.getAll(DB.STORES.seguimientos),
      DB.getAll(DB.STORES.finanzas)
    ]);

    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: { clientes, proyectos, pagos, seguimientos, finanzas }
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ClienteAPP_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    UI.toast('Backup exportado y guardado en tu computador', 'success');
  },

  // ── Importar datos ────────────────────────────────────────────────────────
  async importarDatos(input) {
    const file = input.files[0];
    if (!file) return;

    const ok = await UI.confirm(
      'Esto fusionará los datos del backup con los actuales. ¿Continuar?',
      'Importar Backup'
    );
    if (!ok) { input.value = ''; return; }

    try {
      const text   = await file.text();
      const backup = JSON.parse(text);
      if (!backup.data) throw new Error('Formato inválido');

      const { clientes, proyectos, pagos, seguimientos, finanzas } = backup.data;
      for (const c of (clientes     || [])) await DB.put(DB.STORES.clientes, c);
      for (const p of (proyectos    || [])) await DB.put(DB.STORES.proyectos, p);
      for (const p of (pagos        || [])) await DB.put(DB.STORES.pagos, p);
      for (const s of (seguimientos || [])) await DB.put(DB.STORES.seguimientos, s);
      for (const f of (finanzas     || [])) await DB.put(DB.STORES.finanzas, f);

      UI.toast('Backup importado correctamente', 'success');
      App.updateBadges();
    } catch (e) {
      UI.toast('Error al importar: ' + e.message, 'danger');
    }
    input.value = '';
  },

  // ── Limpiar datos ─────────────────────────────────────────────────────────
  async limpiarDatos() {
    const ok = await UI.confirm(
      '⚠️ Esto eliminará TODOS los clientes, proyectos, pagos y finanzas. No se puede deshacer.',
      'Limpiar Datos'
    );
    if (!ok) return;

    const stores = [
      DB.STORES.clientes, DB.STORES.proyectos,
      DB.STORES.pagos, DB.STORES.seguimientos, DB.STORES.finanzas
    ];
    for (const store of stores) {
      const items = await DB.getAll(store);
      for (const item of items) await DB.delete(store, item.id);
    }

    UI.toast('Datos eliminados', 'warning');
    await this.render();
    App.updateBadges();
  }
};
