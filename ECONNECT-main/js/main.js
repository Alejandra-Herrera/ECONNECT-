document.addEventListener("DOMContentLoaded", () => {
    // Inicializar cupones predeterminados si no existen
    inicializarCuponesPredeterminados();
    
    // Verificar que los elementos de credencial existan y estén configurados correctamente
    const credencialPreview = document.getElementById("credencialPreview");
    const credencialUpload = document.getElementById("credencialUpload");
    const removeCredencial = document.getElementById("removeCredencial");
    
    if (credencialPreview && credencialUpload && removeCredencial) {
        console.log("Elementos de credencial encontrados y configurados correctamente");
        
        // Asegurarse de que el área de vista previa sea clickeable
        credencialPreview.addEventListener("click", function() {
            credencialUpload.click();
        });
    } else {
        console.error("Algunos elementos de credencial no se encontraron:", 
            {credencialPreview, credencialUpload, removeCredencial});
    }

    const usuarioActual = localStorage.getItem("usuario_actual");
    const sesionActiva = localStorage.getItem("sesion_activa");
    
    if (usuarioActual && sesionActiva === "true") {
        const usuario = JSON.parse(usuarioActual);
        
        // Actualizar fecha de último acceso
        usuario.ultimoAcceso = new Date().toISOString();
        localStorage.setItem("usuario_actual", JSON.stringify(usuario));
        
        // Actualizar también en la lista de usuarios
        let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
        const index = usuarios.findIndex(u => u.email === usuario.email);
        if (index !== -1) {
            usuarios[index].ultimoAcceso = usuario.ultimoAcceso;
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
        }
        
        document.querySelector('.intro-section').style.display = 'none';
        document.getElementById("auth-nav").style.display = "none";
        mostrarApp(usuario);
    } else {
        // Limpiar cualquier sesión pendiente
        localStorage.removeItem("usuario_actual");
        localStorage.removeItem("sesion_activa");
        
        document.querySelector('.intro-section').style.display = 'block';
        document.getElementById("auth-nav").style.display = "flex";
        document.getElementById("registro").style.display = "none";
        document.getElementById("login").style.display = "none";
        document.getElementById("main-nav").style.display = "none";
        document.getElementById("mobile-nav").style.display = "none";

        // Mostrar mensaje de bienvenida para visitantes nuevos
        if (!localStorage.getItem("bienvenida_mostrada")) {
            setTimeout(() => {
                mostrarBienvenida("visitante");
            }, 1000);
        }

        // Aplicar estilos específicos para botones en modo móvil
        if (window.innerWidth <= 768) {
            const authNav = document.getElementById('auth-nav');
            authNav.style.flexDirection = 'row';
            authNav.style.justifyContent = 'flex-end';
            authNav.style.flex = '0 0 auto';

            // Aplicar estilos a los botones
            const buttons = authNav.querySelectorAll('.btn');
            buttons.forEach(btn => {
                const text = btn.querySelector('.btn-text');
                if (text) text.style.display = 'none';

                btn.style.width = '40px';
                btn.style.height = '40px';
                btn.style.padding = '0';
                btn.style.borderRadius = '50%';
                btn.style.minWidth = '40px';
            });
        }
    }

    // Iniciar el carrusel
    actualizarCarrusel();

    // Configurar intervalo para el carrusel
    setInterval(() => moverCarrusel(1), 5000);

    // Configurar animación de estadísticas
    configurarAnimacionEstadisticas();
});

function configurarAnimacionEstadisticas() {
    // Verificar si estamos en la página de inicio
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    // Función para verificar si un elemento está visible en la pantalla
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Función para animar contadores
    function animateCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');

        if (isElementInViewport(statsSection)) {
            statNumbers.forEach(statNumber => {
                const id = statNumber.id;
                let targetValue;

                // Valores objetivo para cada estadística
                switch (id) {
                    case 'plasticStat':
                        targetValue = 8.3;
                        break;
                    case 'airStat':
                        targetValue = 7;
                        break;
                    case 'waterStat':
                        targetValue = 80;
                        break;
                    case 'co2Stat':
                        targetValue = 36.8;
                        break;
                    default:
                        return;
                }

                // Si ya se ha animado, no volver a hacerlo
                if (statNumber.dataset.animated === 'true') return;

                // Marcar como animado
                statNumber.dataset.animated = 'true';

                // Animación de conteo
                let startValue = 0;
                const duration = 2000; // 2 segundos
                const startTime = performance.now();

                function updateCounter(timestamp) {
                    const elapsedTime = timestamp - startTime;
                    const progress = Math.min(elapsedTime / duration, 1);

                    // Función de easing para hacer la animación más natural
                    const easeOutQuad = t => t * (2 - t);
                    const easedProgress = easeOutQuad(progress);

                    // Calcular el valor actual
                    let currentValue = startValue + (targetValue - startValue) * easedProgress;

                    // Formatear según el tipo de estadística
                    if (id === 'waterStat') {
                        statNumber.textContent = Math.round(currentValue) + '%';
                    } else {
                        statNumber.textContent = currentValue.toFixed(1);
                    }

                    // Continuar la animación si no ha terminado
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }

                requestAnimationFrame(updateCounter);
            });
        }
    }

    // Verificar la visibilidad al cargar la página
    animateCounters();

    // Verificar la visibilidad al hacer scroll
    window.addEventListener('scroll', animateCounters);
}

function inicializarCuponesPredeterminados() {
    // Verificar si ya existen cupones
    const cupones = JSON.parse(localStorage.getItem('cupones') || '[]');

    // Si no hay cupones, crear algunos predeterminados
    if (cupones.length === 0) {
        const fechaHoy = new Date();

        // Crear fecha de expiración (3 meses después)
        const fechaExpiracion = new Date(fechaHoy);
        fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 3);

        // Crear fecha de expiración más cercana (1 mes después)
        const fechaExpiracionCorta = new Date(fechaHoy);
        fechaExpiracionCorta.setMonth(fechaExpiracionCorta.getMonth() + 1);

        // Crear fecha de expiración más lejana (6 meses después)
        const fechaExpiracionLarga = new Date(fechaHoy);
        fechaExpiracionLarga.setMonth(fechaExpiracionLarga.getMonth() + 6);

        const cuponesPredeterminados = [{
            titulo: "20% de descuento en H&M",
            codigo: "ECO20HM",
            puntos: 150,
            expiracion: fechaExpiracion.toISOString().split('T')[0],
            tienda: "H&M"
        }, {
            titulo: "15% de descuento en Zara",
            codigo: "ECOZARA15",
            puntos: 120,
            expiracion: fechaExpiracionLarga.toISOString().split('T')[0],
            tienda: "Zara"
        }, {
            titulo: "10% en productos ecológicos de Walmart",
            codigo: "ECOWMT10",
            puntos: 80,
            expiracion: fechaExpiracionCorta.toISOString().split('T')[0],
            tienda: "Walmart"
        }, {
            titulo: "25% en productos sostenibles de Adidas",
            codigo: "ECOADI25",
            puntos: 200,
            expiracion: fechaExpiracionLarga.toISOString().split('T')[0],
            tienda: "Adidas"
        }, {
            titulo: "2x1 en productos orgánicos de Whole Foods",
            codigo: "ECOWF2X1",
            puntos: 180,
            expiracion: fechaExpiracion.toISOString().split('T')[0],
            tienda: "Whole Foods"
        }, {
            titulo: "30% en botellas reutilizables de Starbucks",
            codigo: "ECOSBUX30",
            puntos: 100,
            expiracion: fechaExpiracionCorta.toISOString().split('T')[0],
            tienda: "Starbucks"
        }, {
            titulo: "15% en productos de The Body Shop",
            codigo: "ECOTBS15",
            puntos: 120,
            expiracion: fechaExpiracion.toISOString().split('T')[0],
            tienda: "The Body Shop"
        }, {
            titulo: "50% en segunda prenda de Patagonia",
            codigo: "ECOPAT50",
            puntos: 250,
            expiracion: fechaExpiracionLarga.toISOString().split('T')[0],
            tienda: "Patagonia"
        }];

        localStorage.setItem('cupones', JSON.stringify(cuponesPredeterminados));
    }
}

function mostrarFormularioLogin() {
    document.querySelector('.intro-section').style.display = 'none';
    document.getElementById("registro").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("app").style.display = "none";
    document.getElementById("main-nav").style.display = "none";
    document.getElementById("mobile-nav").style.display = "none";
    document.getElementById("auth-nav").style.display = "flex";
}

function mostrarFormularioRegistro() {
    document.querySelector('.intro-section').style.display = 'none';
    document.getElementById("registro").style.display = "block";
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "none";
    document.getElementById("main-nav").style.display = "none";
    document.getElementById("mobile-nav").style.display = "none";
    document.getElementById("auth-nav").style.display = "flex";
}

function iniciarSesion() {
    const identificador = document.getElementById("identificador").value;
    const clave = document.getElementById("claveLogin").value;

    if (!identificador || !clave) {
        mostrarMensaje("Por favor, completa todos los campos", "error");
        return;
    }

    // Obtener usuarios
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    // Buscar usuario por correo o matrícula
    const usuario = usuarios.find(u => 
        u.email === identificador || u.matricula === identificador
    );

    if (!usuario) {
        mostrarMensaje("Usuario no encontrado", "error");
        return;
    }

    if (usuario.clave !== clave) {
        mostrarMensaje("Contraseña incorrecta", "error");
        return;
    }

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date().toISOString();
    localStorage.setItem("usuario_actual", JSON.stringify(usuario));
    localStorage.setItem("sesion_activa", "true");

    // Actualizar también en la lista de usuarios
    const index = usuarios.findIndex(u => u.email === usuario.email);
    if (index !== -1) {
        usuarios[index].ultimoAcceso = usuario.ultimoAcceso;
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    // Mostrar mensaje de éxito
    mostrarMensaje("¡Bienvenido de nuevo!", "success");

    // Mostrar la aplicación
    mostrarApp(usuario);
}

function crearUsuario() {
    const email = document.getElementById("correo").value;
    const nombre = document.getElementById("nombre").value;
    const clave = document.getElementById("clave").value;
    const matricula = document.getElementById("matricula").value;
    const materia = document.getElementById("materia").value;
    const semestre = document.getElementById("semestre").value;
    const grupo = document.getElementById("grupo").value;

    // Validar que todos los campos estén llenos
    if (!email || !nombre || !clave || !matricula || !materia || !semestre || !grupo) {
        mostrarMensaje("Por favor, completa todos los campos", "error");
        return;
    }

    // Obtener usuarios existentes
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    // Verificar si el correo o la matrícula ya están registrados
    if (usuarios.some(u => u.email === email)) {
        mostrarMensaje("Este correo electrónico ya está registrado", "error");
        return;
    }

    if (usuarios.some(u => u.matricula === matricula)) {
        mostrarMensaje("Esta matrícula ya está registrada", "error");
        return;
    }

    // Crear nuevo usuario
    const nuevoUsuario = {
        email,
        nombre,
        clave,
        matricula,
        materia,
        semestre,
        grupo,
        puntos: 0,
        nivel: 1,
        insignias: [],
        desafiosCompletados: [],
        ultimoAcceso: new Date().toISOString()
    };

    // Agregar usuario a la lista
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Iniciar sesión automáticamente
    localStorage.setItem("usuario_actual", JSON.stringify(nuevoUsuario));
    localStorage.setItem("sesion_activa", "true");

    // Mostrar mensaje de éxito
    mostrarMensaje("¡Usuario creado exitosamente!", "success");
    mostrarConfeti();

    // Mostrar la aplicación
    mostrarApp(nuevoUsuario);
}

function mostrarApp(usuario) {
    document.querySelector('.intro-section').style.display = 'none';
    document.getElementById("auth-nav").style.display = "none";
    document.getElementById("registro").style.display = "none";
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";

    // Mostrar navegación según el dispositivo
    if (window.innerWidth <= 768) {
        document.getElementById("main-nav").style.display = "none";
        document.getElementById("mobile-nav").style.display = "flex";
    } else {
        document.getElementById("main-nav").style.display = "flex";
        document.getElementById("mobile-nav").style.display = "none";
    }

    // Actualizar barra de progreso
    actualizarBarraProgreso(usuario);

    // Cargar estado de desafíos
    cargarEstadoDesafios(usuario);
}

function actualizarBarraProgreso(usuario) {
    const puntosActuales = usuario.puntos || 0;
    const puntosSiguienteNivel = 100; // Puntos necesarios para el siguiente nivel
    const porcentaje = Math.min((puntosActuales / puntosSiguienteNivel) * 100, 100);
    
    // Actualizar la barra de progreso
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${porcentaje}%`;
    }

    // Actualizar el texto de puntos
    const puntosTexto = document.querySelector('.progress-container p');
    if (puntosTexto) {
        puntosTexto.textContent = `${puntosActuales}/${puntosSiguienteNivel} puntos`;
    }

    // Actualizar el nivel
    const nivelBadge = document.getElementById('nivel-badge');
    if (nivelBadge) {
        nivelBadge.textContent = `Nivel ${usuario.nivel || 1}`;
    }
}

function cargarEstadoDesafios(usuario) {
    // Si el usuario tiene desafíos completados, actualizar la interfaz
    if (usuario && usuario.desafiosCompletados && Array.isArray(usuario.desafiosCompletados)) {
        usuario.desafiosCompletados.forEach(desafioId => {
            const desafioElement = document.getElementById(`completeTask${desafioId}`);
            if (desafioElement) {
                const cardElement = desafioElement.closest('.challenge-card');
                if (cardElement) {
                    // Marcar como completado visualmente
                    cardElement.classList.add('completed');

                    // Actualizar el estado del desafío
                    const statusElement = cardElement.querySelector('.challenge-status');
                    if (statusElement) {
                        if (statusElement.textContent.includes('/')) {
                            const partes = statusElement.textContent.split('/');
                            if (partes.length === 2) {
                                statusElement.textContent = `${partes[1]}/${partes[1]}`;
                            }
                        } else {
                            statusElement.textContent = 'Completado';
                        }
                    }

                    // Mostrar y actualizar el botón
                    desafioElement.style.display = 'block';
                    desafioElement.innerHTML = '<i class="fas fa-check-circle"></i> Completado';
                    desafioElement.disabled = true;
                }
            }
        });
    }

    // Cargar desafíos adicionales que el usuario ya ha desbloqueado
    cargarDesafiosDesbloqueados(usuario);
}

function cargarDesafiosDesbloqueados(usuario) {
    // Si el usuario no tiene la propiedad desafiosMostrados, inicializarla
    if (!usuario.desafiosMostrados) {
        usuario.desafiosMostrados = [1, 2, 3, 4, 5]; // Desafíos iniciales
        localStorage.setItem('usuario_actual', JSON.stringify(usuario));

        // Actualizar en lista de usuarios
        let usuarios = JSON.parse(localStorage.getItem('usuarios'));
        const index = usuarios.findIndex(u => u.email === usuario.email);
        if (index !== -1) {
            usuarios[index] = usuario;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }

        return; // No hay desafíos adicionales que cargar
    }

    // Filtrar solo los desafíos adicionales (no los iniciales 1-5)
    const desafiosAdicionales = usuario.desafiosMostrados.filter(id => id > 5);

    // Si no hay desafíos adicionales, salir
    if (desafiosAdicionales.length === 0) return;

    // Contenedor de desafíos
    const container = document.querySelector('.challenges-grid');

    // Para cada desafío adicional
    desafiosAdicionales.forEach(desafioId => {
                // Buscar en el banco de desafíos
                const desafio = bancoDeSafios.find(d => d.id === desafioId);
                if (!desafio) return; // Si no se encuentra, saltar

                // Verificar si el desafío ya está completado
                const completado = usuario.desafiosCompletados && usuario.desafiosCompletados.includes(desafioId);

                // Crear elemento HTML para el desafío
                const desafioHTML = `
            <div class="challenge-card ${completado ? 'completed' : ''}" data-difficulty="${desafio.dificultad}">
                <div class="challenge-header">
                    <h3 class="challenge-title">${desafio.titulo}</h3>
                    <span class="challenge-status">${completado ? (desafio.estado.includes('/') ? desafio.estado.split('/')[1] + '/' + desafio.estado.split('/')[1] : 'Completado') : desafio.estado}</span>
                </div>
                <div class="challenge-badges">
                    <span class="challenge-badge ${desafio.dificultad}">${desafio.dificultad === 'facil' ? 'Fácil' : desafio.dificultad === 'medio' ? 'Medio' : 'Difícil'}</span>
                    <span class="challenge-badge points">${desafio.puntos} puntos</span>
                </div>
                <p style="margin-bottom: 1rem; color: #64748b;">${desafio.descripcion}</p>
                ${!completado ? `
                <div class="file-upload">
                    <label class="file-upload-label" for="evidence${desafio.id}">
                        <i class="fas fa-cloud-upload-alt"></i>
                        Subir Evidencia
                    </label>
                    <input type="file" id="evidence${desafio.id}" onchange="subirEvidencia(${desafio.id})">
                </div>
                ` : ''}
                <button class="btn btn-primary complete-task-btn" id="completeTask${desafio.id}" 
                    style="display: ${completado ? 'block' : 'none'}; margin-top: 1rem; width: 100%;" 
                    onclick="completarDesafio(${desafio.id})" ${completado ? 'disabled' : ''}>
                    <i class="fas fa-check-circle"></i> ${completado ? 'Completado' : 'Marcar como Completado'}
                </button>
            </div>
        `;
        
        // Agregar al DOM
        const temp = document.createElement('div');
        temp.innerHTML = desafioHTML;
        container.appendChild(temp.firstElementChild);
    });
}

function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.dashboard-section').forEach(seccion => {
        seccion.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(seccionId).classList.add('active');
    
    // Actualizar estado activo de los botones móviles
    document.querySelectorAll('.mobile-nav .nav-item').forEach(btn => {
        if (btn.textContent.trim().toLowerCase().includes(seccionId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Actualizar estado activo de los botones de escritorio
    document.querySelectorAll('.desktop-nav .btn-primary').forEach(btn => {
        if (btn.textContent.trim().toLowerCase().includes(seccionId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (seccionId === 'recompensas') {
        cargarCupones();
        
        // Verificar si el usuario es administrador (puedes ajustar esta lógica según tus necesidades)
        if (usuario.email === 'admin@econnect.com') {
            document.getElementById('admin-cupones').style.display = 'block';
        }
    }
}

function subirEvidencia(desafioId) {
    const evidenciaInput = document.getElementById(`evidence${desafioId}`);
    const archivo = evidenciaInput.files[0];

    if (!archivo) {
        return;
    }

    alert(`¡Evidencia del Desafío ${desafioId} subida con éxito!`);
    
    // Obtener información del desafío
    const desafioElement = evidenciaInput.closest('.challenge-card');
    const dificultad = desafioElement ? desafioElement.dataset.difficulty : 'facil';
    
    // Calcular puntos y créditos según dificultad
    let puntos = 25;
    let creditos = 5;
    
    switch(dificultad) {
        case 'medio':
            puntos = 50;
            creditos = 10;
            break;
        case 'dificil':
            puntos = 100;
            creditos = 20;
            break;
    }
    
    // Actualizar puntos y créditos del usuario
    const usuario = JSON.parse(localStorage.getItem('usuario_actual'));
    usuario.puntos += puntos;
    usuario.creditos = (usuario.creditos || 0) + creditos;
    
    if (usuario.puntos >= 100) {
        usuario.nivel++;
        usuario.puntos -= 100;
    }
    
    localStorage.setItem('usuario_actual', JSON.stringify(usuario));
    
    // Actualizar interfaz
    document.getElementById('nivel-badge').textContent = `Nivel ${usuario.nivel}`;
    if (document.getElementById('user-credits')) {
        document.getElementById('user-credits').textContent = usuario.creditos;
    }
    
    // Actualizar en la lista de usuarios
    let usuarios = JSON.parse(localStorage.getItem('usuarios'));
    const index = usuarios.findIndex(u => u.email === usuario.email);
    if (index !== -1) {
        usuarios[index] = usuario;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    
    // Mostrar el botón de marcar como completado
    const completeButton = document.getElementById(`completeTask${desafioId}`);
    if (completeButton) {
        completeButton.style.display = 'block';
        
        // Ocultar el selector de archivos después de subir la evidencia
        const fileUpload = desafioElement.querySelector('.file-upload');
        if (fileUpload) {
            fileUpload.style.display = 'none';
        }
        
        // Mostrar mensaje de evidencia subida
        const evidenciaMsg = document.createElement('div');
        evidenciaMsg.className = 'evidence-message';
        evidenciaMsg.innerHTML = `
            <div style="display: flex; align-items: center; margin: 1rem 0; color: var(--primary-color);">
                <i class="fas fa-check-circle" style="font-size: 1.2rem; margin-right: 0.5rem;"></i>
                <span>Evidencia subida: ${archivo.name}</span>
            </div>
        `;
        
        // Insertar el mensaje antes del botón de completar
        desafioElement.insertBefore(evidenciaMsg, completeButton);
    }
}

function completarDesafio(desafioId) {
    const usuarioActual = JSON.parse(localStorage.getItem("usuario_actual"));
    if (!usuarioActual) return;

    // Obtener el desafío completado
    const desafioCompletado = document.querySelector(`#completeTask${desafioId}`).closest('.challenge-card');
    const puntosDesafio = parseInt(desafioCompletado.querySelector('.challenge-badge.points').textContent);

    // Actualizar puntos del usuario
    usuarioActual.puntos = (usuarioActual.puntos || 0) + puntosDesafio;

    // Verificar si sube de nivel
    const nivelActual = usuarioActual.nivel || 1;
    const puntosSiguienteNivel = nivelActual * 100;
    
    if (usuarioActual.puntos >= puntosSiguienteNivel) {
        usuarioActual.nivel = nivelActual + 1;
        mostrarMensaje(`¡Felicidades! Has subido al nivel ${usuarioActual.nivel}`, "success");
        mostrarConfeti();
    }

    // Agregar el desafío a la lista de completados
    if (!usuarioActual.desafiosCompletados) {
        usuarioActual.desafiosCompletados = [];
    }
    usuarioActual.desafiosCompletados.push(desafioId);

    // Actualizar el usuario en localStorage
    localStorage.setItem("usuario_actual", JSON.stringify(usuarioActual));

    // Actualizar la lista de usuarios
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const index = usuarios.findIndex(u => u.email === usuarioActual.email);
    if (index !== -1) {
        usuarios[index] = usuarioActual;
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    // Actualizar la interfaz
    actualizarBarraProgreso(usuarioActual);
    mostrarMensaje("¡Desafío completado!", "success");

    // Ocultar el botón de completar
    document.getElementById(`completeTask${desafioId}`).style.display = "none";
}

// Banco de desafíos adicionales
const bancoDeSafios = [
    {
        id: 101,
        titulo: "Limpieza de Playa",
        descripcion: "Participa en una jornada de limpieza de playa o río en tu comunidad.",
        dificultad: "medio",
        puntos: 120,
        estado: "0/1"
    },
    {
        id: 102,
        titulo: "Huerto Urbano",
        descripcion: "Crea un pequeño huerto urbano en tu hogar con plantas comestibles.",
        dificultad: "facil",
        puntos: 80,
        estado: "0/1"
    },
    {
        id: 103,
        titulo: "Cero Plásticos",
        descripcion: "Evita el uso de plásticos de un solo uso durante una semana completa.",
        dificultad: "medio",
        puntos: 100,
        estado: "0/7 días"
    },
    {
        id: 104,
        titulo: "Taller Ecológico",
        descripcion: "Organiza un taller sobre reciclaje o sostenibilidad en tu comunidad.",
        dificultad: "dificil",
        puntos: 200,
        estado: "0/1"
    },
    {
        id: 105,
        titulo: "Compostaje",
        descripcion: "Implementa un sistema de compostaje para tus residuos orgánicos.",
        dificultad: "medio",
        puntos: 150,
        estado: "0/1"
    },
    {
        id: 106,
        titulo: "Transporte Cero Emisiones",
        descripcion: "Utiliza exclusivamente transporte sin emisiones (bicicleta, caminar) durante 5 días.",
        dificultad: "facil",
        puntos: 75,
        estado: "0/5 días"
    },
    {
        id: 107,
        titulo: "Ahorro Energético",
        descripcion: "Reduce tu consumo de energía eléctrica en un 15% durante un mes.",
        dificultad: "medio",
        puntos: 130,
        estado: "0/30 días"
    },
    {
        id: 108,
        titulo: "Reforestación",
        descripcion: "Participa en una campaña de reforestación o planta 3 árboles por tu cuenta.",
        dificultad: "dificil",
        puntos: 180,
        estado: "0/3"
    },
    {
        id: 109,
        titulo: "Educación Ambiental",
        descripcion: "Imparte una charla sobre medio ambiente en un colegio o centro comunitario.",
        dificultad: "dificil",
        puntos: 220,
        estado: "0/1"
    },
    {
        id: 110,
        titulo: "Consumo Local",
        descripcion: "Compra exclusivamente productos locales y de temporada durante 2 semanas.",
        dificultad: "medio",
        puntos: 140,
        estado: "0/14 días"
    }
];

// Función para agregar un nuevo desafío
function agregarNuevoDesafio() {
    // Verificar cuántos desafíos completados tiene el usuario
    const usuario = JSON.parse(localStorage.getItem('usuario_actual'));
    const desafiosCompletados = usuario.desafiosCompletados || [];
    
    // Obtener desafíos ya mostrados (incluyendo los iniciales 1-5)
    const desafiosMostrados = usuario.desafiosMostrados || [1, 2, 3, 4, 5];
    
    // Filtrar desafíos no mostrados aún
    const desafiosDisponibles = bancoDeSafios.filter(d => !desafiosMostrados.includes(d.id));
    
    // Si no hay más desafíos disponibles
    if (desafiosDisponibles.length === 0) {
        mostrarNotificacion("¡Has desbloqueado todos los desafíos disponibles! Pronto añadiremos más.");
        return;
    }
    
    // Seleccionar un desafío aleatorio
    const nuevoDesafio = desafiosDisponibles[Math.floor(Math.random() * desafiosDisponibles.length)];
    
    // Marcar como mostrado
    desafiosMostrados.push(nuevoDesafio.id);
    usuario.desafiosMostrados = desafiosMostrados;
    localStorage.setItem('usuario_actual', JSON.stringify(usuario));
    
    // Actualizar en lista de usuarios
    let usuarios = JSON.parse(localStorage.getItem('usuarios'));
    const index = usuarios.findIndex(u => u.email === usuario.email);
    if (index !== -1) {
        usuarios[index] = usuario;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    
    // Crear elemento HTML para el nuevo desafío
    const desafioHTML = `
        <div class="challenge-card" data-difficulty="${nuevoDesafio.dificultad}">
            <div class="challenge-header">
                <h3 class="challenge-title">${nuevoDesafio.titulo}</h3>
                <span class="challenge-status">${nuevoDesafio.estado}</span>
            </div>
            <div class="challenge-badges">
                <span class="challenge-badge ${nuevoDesafio.dificultad}">${nuevoDesafio.dificultad === 'facil' ? 'Fácil' : nuevoDesafio.dificultad === 'medio' ? 'Medio' : 'Difícil'}</span>
                <span class="challenge-badge points">${nuevoDesafio.puntos} puntos</span>
            </div>
            <p style="margin-bottom: 1rem; color: #64748b;">${nuevoDesafio.descripcion}</p>
            <div class="file-upload">
                <label class="file-upload-label" for="evidence${nuevoDesafio.id}">
                    <i class="fas fa-cloud-upload-alt"></i>
                    Subir Evidencia
                </label>
                <input type="file" id="evidence${nuevoDesafio.id}" onchange="subirEvidencia(${nuevoDesafio.id})">
            </div>
            <button class="btn btn-primary complete-task-btn" id="completeTask${nuevoDesafio.id}" style="display: none; margin-top: 1rem; width: 100%;" onclick="completarDesafio(${nuevoDesafio.id})">
                <i class="fas fa-check-circle"></i> Marcar como Completado
            </button>
        </div>
    `;
    
    // Agregar el nuevo desafío al contenedor
    const container = document.querySelector('.challenges-grid');
    
    // Crear un elemento temporal para convertir la cadena HTML en un nodo DOM
    const temp = document.createElement('div');
    temp.innerHTML = desafioHTML;
    const nuevoDesafioElement = temp.firstElementChild;
    
    // Aplicar animación de entrada
    nuevoDesafioElement.style.opacity = '0';
    nuevoDesafioElement.style.transform = 'translateY(20px)';
    
    // Añadir al DOM
    container.appendChild(nuevoDesafioElement);
    
    // Mostrar notificación
    mostrarNotificacion(`¡Nuevo desafío desbloqueado: "${nuevoDesafio.titulo}"!`);
    
    // Animar entrada
    setTimeout(() => {
        nuevoDesafioElement.style.transition = 'all 0.5s ease';
        nuevoDesafioElement.style.opacity = '1';
        nuevoDesafioElement.style.transform = 'translateY(0)';
    }, 100);
}

function mostrarNotificacion(mensaje) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; background-color: var(--primary-color); color: white; 
                padding: 1rem; border-radius: var(--border-radius); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
                z-index: 9999; max-width: 300px; animation: slideIn 0.3s ease;">
            <div style="display: flex; align-items: center;">
                <i class="fas fa-trophy" style="font-size: 1.5rem; margin-right: 0.75rem; color: #FFD700;"></i>
                <div>
                    ${mensaje}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    // Eliminar después de 5 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 5000);
}

function mostrarConfeti() {
    // Crear elemento de confeti
    const confeti = document.createElement('div');
    confeti.className = 'confeti-container';
    confeti.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
    `;
    
    // Crear 50 piezas de confeti
    for (let i = 0; i < 50; i++) {
        const pieza = document.createElement('div');
        const color = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 4)];
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        
        pieza.style.cssText = `
            position: absolute;
            top: -20px;
            left: ${left}%;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: confeti ${duration}s ease-in forwards ${delay}s;
        `;
        
        confeti.appendChild(pieza);
    }
    
    document.body.appendChild(confeti);
    
    // Eliminar después de 5 segundos
    setTimeout(() => {
        document.body.removeChild(confeti);
    }, 5000);
}

function cerrarSesion() {
    if (confirm("¿Deseas cerrar sesión?")) {
        // Obtener usuario actual
        const usuarioActual = JSON.parse(localStorage.getItem("usuario_actual"));
        
        if (usuarioActual) {
            // Actualizar estado de sesión del usuario en la lista de usuarios
            let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const index = usuarios.findIndex(u => u.email === usuarioActual.email);
            if (index !== -1) {
                usuarios[index].sesionActiva = false;
                usuarios[index].ultimoAcceso = new Date().toISOString();
                localStorage.setItem("usuarios", JSON.stringify(usuarios));
            }
        }
        
        // Eliminar datos de sesión
        localStorage.removeItem("usuario_actual");
        localStorage.removeItem("sesion_activa");
        
        // Ocultar elementos de usuario autenticado
        document.getElementById("main-nav").style.display = "none";
        document.getElementById("mobile-nav").style.display = "none";
        document.getElementById("app").style.display = "none";
        
        // Mostrar elementos de inicio
        document.querySelector('.intro-section').style.display = 'block';
        document.getElementById("registro").style.display = "none";
        document.getElementById("login").style.display = "none";

        // Ajustar los botones de autenticación para móvil
        if (window.innerWidth <= 768) {
            const authNav = document.getElementById('auth-nav');
            authNav.style.flexDirection = 'row';
            authNav.style.justifyContent = 'flex-end';
            authNav.style.flex = '0 0 auto';
            
            // Aplicar estilos a los botones
            const buttons = authNav.querySelectorAll('.btn');
            buttons.forEach(btn => {
                const text = btn.querySelector('.btn-text');
                if (text) text.style.display = 'none';
                
                btn.style.width = '40px';
                btn.style.height = '40px';
                btn.style.padding = '0';
                btn.style.borderRadius = '50%';
                btn.style.minWidth = '40px';
            });
        }

        // Reiniciar el carrusel
        slideActual = 0;
        actualizarCarrusel();
        
        // Hacer scroll al inicio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function verPerfil() {
    const modal = document.getElementById("perfilModal");
    const usuarioActual = JSON.parse(localStorage.getItem("usuario_actual"));
    
    if (usuarioActual) {
        // Actualizar estadísticas
        document.getElementById("nivel-perfil").textContent = usuarioActual.nivel || 1;
        document.getElementById("puntos-perfil").textContent = usuarioActual.puntos || 0;
        document.getElementById("insignias-perfil").textContent = usuarioActual.insignias || 0;
        
        // Rellenar el formulario con los datos del usuario
        document.getElementById("perfilNombre").value = usuarioActual.nombre;
        document.getElementById("perfilEmail").value = usuarioActual.email;
        document.getElementById("perfilClave").value = "";
        
        // Cargar imagen de credencial si existe
        if (usuarioActual.credencial) {
            document.getElementById("credencialImage").src = usuarioActual.credencial;
            document.getElementById("credencialImage").style.display = "block";
            document.getElementById("uploadPlaceholder").style.display = "none";
            document.getElementById("removeCredencial").style.display = "inline-block";
        } else {
            document.getElementById("credencialImage").style.display = "none";
            document.getElementById("uploadPlaceholder").style.display = "flex";
            document.getElementById("removeCredencial").style.display = "none";
        }
        
        // Asegurar que el div de credencial sea clickeable
        document.getElementById("credencialPreview").onclick = function() {
            document.getElementById("credencialUpload").click();
        };
        
        // Mostrar el modal
        modal.style.display = "block";
        
        // Mensaje para confirmar que la sección de credencial está visible
        console.log("Modal de perfil abierto con sección de credencial");
    } else {
        alert("Debe iniciar sesión para ver su perfil");
        mostrarFormularioLogin();
    }
}

// Función para previsualizar la credencial antes de guardar
function previewCredencial(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log("Archivo seleccionado:", file.name);
    
    // Verificar tipo de archivo
    if (!file.type.match('image.*')) {
        alert("Por favor, selecciona una imagen válida (JPG, PNG)");
        return;
    }
    
    // Verificar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert("La imagen es demasiado grande. El tamaño máximo es 2MB.");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log("Imagen cargada correctamente");
        const img = document.getElementById("credencialImage");
        img.src = e.target.result;
        img.style.display = "block";
        
        document.getElementById("uploadPlaceholder").style.display = "none";
        document.getElementById("removeCredencial").style.display = "inline-block";
    };
    
    reader.onerror = function(error) {
        console.error("Error al leer el archivo:", error);
        alert("Ocurrió un error al cargar la imagen. Por favor, intenta de nuevo.");
    };
    
    reader.readAsDataURL(file);
}

// Función para eliminar la credencial
function eliminarCredencial() {
    if (confirm("¿Estás seguro de que deseas eliminar tu credencial?")) {
        document.getElementById("credencialImage").src = "";
        document.getElementById("credencialImage").style.display = "none";
        document.getElementById("uploadPlaceholder").style.display = "flex";
        document.getElementById("removeCredencial").style.display = "none";
        document.getElementById("credencialUpload").value = "";
    }
}

function cerrarModalPerfil() {
    document.getElementById("perfilModal").style.display = "none";
}

function actualizarPerfil(event) {
    event.preventDefault();
    
    const usuarioActual = JSON.parse(localStorage.getItem("usuario_actual"));
    const nuevoNombre = document.getElementById("perfilNombre").value;
    const nuevoEmail = document.getElementById("perfilEmail").value;
    const nuevaClave = document.getElementById("perfilClave").value;
    
    if (usuarioActual) {
        // Actualizar datos del usuario
        usuarioActual.nombre = nuevoNombre;
        usuarioActual.email = nuevoEmail;
        
        // Actualizar contraseña solo si se proporciona una nueva
        if (nuevaClave.trim() !== "") {
            usuarioActual.clave = nuevaClave;
        }
        
        // Actualizar imagen de credencial
        const img = document.getElementById("credencialImage");
        if (img.style.display === "block") {
            usuarioActual.credencial = img.src;
        } else {
            // Si la imagen fue eliminada
            delete usuarioActual.credencial;
        }
        
        // Actualizar en localStorage
        localStorage.setItem("usuario_actual", JSON.stringify(usuarioActual));
        
        // Actualizar en la lista de usuarios
        const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
        const index = usuarios.findIndex(u => u.email === usuarioActual.email);
        if (index !== -1) {
            usuarios[index] = usuarioActual;
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
        }
        
        // Cerrar modal y mostrar mensaje
        cerrarModalPerfil();
        mostrarMensaje("Perfil actualizado correctamente", "success");
    }
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById("perfilModal");
    if (event.target === modal) {
        cerrarModalPerfil();
    }
}

// Agregar listener para cambios de tamaño de ventana
window.addEventListener('resize', function() {
    const usuarioActual = JSON.parse(localStorage.getItem("usuario_actual"));
    if (usuarioActual) {
        if (window.innerWidth <= 768) {
            document.getElementById("main-nav").style.display = "none";
            document.getElementById("mobile-nav").style.display = "flex";
        } else {
            document.getElementById("main-nav").style.display = "flex";
            document.getElementById("mobile-nav").style.display = "none";
        }
    }
});

// Funciones para manejo de cupones
function cargarCupones() {
    const cupones = JSON.parse(localStorage.getItem('cupones') || '[]');
    const usuario = JSON.parse(localStorage.getItem('usuario_actual'));
    const container = document.getElementById('cupones-container');
    container.innerHTML = '';

    cupones.forEach(cupon => {
        const puedeReclamar = usuario.puntos >= cupon.puntos;
        const expirado = new Date(cupon.expiracion) < new Date();
        
        // Determinar clase CSS para la tienda
        let tiendaClase = '';
        let logoIcon = 'fa-tag';
        
        switch(cupon.tienda) {
            case 'H&M':
                tiendaClase = 'hm';
                logoIcon = 'fa-tshirt';
                break;
            case 'Zara':
                tiendaClase = 'zara';
                logoIcon = 'fa-tshirt';
                break;
            case 'Walmart':
                tiendaClase = 'walmart';
                logoIcon = 'fa-shopping-cart';
                break;
            case 'Adidas':
                tiendaClase = 'adidas';
                logoIcon = 'fa-running';
                break;
            case 'Whole Foods':
                tiendaClase = 'whole-foods';
                logoIcon = 'fa-apple-alt';
                break;
            case 'Starbucks':
                tiendaClase = 'starbucks';
                logoIcon = 'fa-coffee';
                break;
            case 'The Body Shop':
                tiendaClase = 'body-shop';
                logoIcon = 'fa-spa';
                break;
            case 'Patagonia':
                tiendaClase = 'patagonia';
                logoIcon = 'fa-mountain';
                break;
            default:
                logoIcon = 'fa-tag';
        }
        
        const cuponElement = document.createElement('div');
        cuponElement.className = `coupon-card ${tiendaClase}`;
        cuponElement.dataset.puntos = cupon.puntos;
        cuponElement.dataset.expiracion = cupon.expiracion;
        cuponElement.dataset.tienda = cupon.tienda || '';
        
        cuponElement.innerHTML = `
            <div class="coupon-store">
                <div class="store-logo">
                    <i class="fas ${logoIcon}"></i>
                </div>
                <div class="store-name">${cupon.tienda || 'Econnect'}</div>
            </div>
            <div class="coupon-header">
                <div class="coupon-title">${cupon.titulo}</div>
                <div class="coupon-points">${cupon.puntos} puntos</div>
            </div>
            <div class="coupon-code">${cupon.codigo}</div>
            <div class="coupon-footer">
                <div class="coupon-expiry">
                    <i class="fas fa-clock"></i>
                    Expira: ${new Date(cupon.expiracion).toLocaleDateString()}
                </div>
                <button class="coupon-claim" 
                        onclick="reclamarCupon('${cupon.codigo}')"
                        ${(!puedeReclamar || expirado) ? 'disabled' : ''}>
                    ${expirado ? 'Expirado' : puedeReclamar ? 'Reclamar' : 'Puntos insuficientes'}
                </button>
            </div>
        `;
        container.appendChild(cuponElement);
    });
}

function agregarCupon(event) {
    event.preventDefault();
    
    const cupon = {
        titulo: document.getElementById('cuponTitulo').value,
        codigo: document.getElementById('cuponCodigo').value,
        puntos: parseInt(document.getElementById('cuponPuntos').value),
        expiracion: document.getElementById('cuponExpiracion').value,
        tienda: document.getElementById('cuponTienda').value
    };

    let cupones = JSON.parse(localStorage.getItem('cupones') || '[]');
    cupones.push(cupon);
    localStorage.setItem('cupones', JSON.stringify(cupones));

    document.getElementById('formCupon').reset();
    cargarCupones();
    alert('Cupón agregado exitosamente');
}

function reclamarCupon(codigo) {
    const usuario = JSON.parse(localStorage.getItem('usuario_actual'));
    const cupones = JSON.parse(localStorage.getItem('cupones') || '[]');
    const cupon = cupones.find(c => c.codigo === codigo);

    if (cupon && usuario.puntos >= cupon.puntos) {
        usuario.puntos -= cupon.puntos;
        localStorage.setItem('usuario_actual', JSON.stringify(usuario));
        
        // Actualizar en la lista de usuarios
        let usuarios = JSON.parse(localStorage.getItem('usuarios'));
        const index = usuarios.findIndex(u => u.email === usuario.email);
        if (index !== -1) {
            usuarios[index] = usuario;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }

        alert(`¡Cupón reclamado exitosamente!\nCódigo: ${codigo}\nPuntos restantes: ${usuario.puntos}`);
        cargarCupones();
    }
}

// Funciones para el carrusel
let slideActual = 0;
const totalSlides = document.querySelectorAll('.carousel-item').length;

function moverCarrusel(direccion) {
    slideActual = (slideActual + direccion + totalSlides) % totalSlides;
    actualizarCarrusel();
}

function irASlide(index) {
    slideActual = index;
    actualizarCarrusel();
}

function actualizarCarrusel() {
    const carrusel = document.querySelector('.carousel-inner');
    carrusel.style.transform = `translateX(-${slideActual * 100}%)`;
    
    // Actualizar indicadores
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.classList.toggle('active', index === slideActual);
    });
}

// Auto-avance del carrusel
setInterval(() => moverCarrusel(1), 5000);

// Script mejorado para ajustar los botones en móvil
document.addEventListener('DOMContentLoaded', function() {
    function adjustMobileLayout() {
        const headerContent = document.querySelector('.header-content');
        const authNav = document.getElementById('auth-nav');
        const usuarioActual = localStorage.getItem("usuario_actual");
        
        // Forzar el estilo correcto en móvil
        if (window.innerWidth <= 768) {
            headerContent.style.flexDirection = 'row';
            headerContent.style.justifyContent = 'space-between';
            headerContent.style.alignItems = 'center';
            
            // Si el usuario está autenticado, ocultar los botones de auth
            if (usuarioActual) {
                if (authNav) {
                    authNav.style.display = 'none';
                }
            }
            // Si no está autenticado, mostrar botones de auth
            else if (authNav) {
                authNav.style.display = 'flex';
                authNav.style.flexDirection = 'row';
                authNav.style.justifyContent = 'flex-end';
                authNav.style.flex = '0 0 auto';
                
                // Aplicar estilos a los botones
                const buttons = authNav.querySelectorAll('.btn');
                buttons.forEach(btn => {
                    const text = btn.querySelector('.btn-text');
                    if (text) text.style.display = 'none';
                    
                    btn.style.width = '40px';
                    btn.style.height = '40px';
                    btn.style.padding = '0';
                    btn.style.borderRadius = '50%';
                    btn.style.minWidth = '40px';
                });
            }
        }
    }
    
    // Ejecutar inmediatamente y en cada cambio de tamaño
    adjustMobileLayout();
    window.addEventListener('resize', adjustMobileLayout);
    
    // Como refuerzo, ejecutar después de un breve retraso para asegurar que los estilos se apliquen
    setTimeout(adjustMobileLayout, 100);
});

// Agregar texto de tooltip a los botones de icono
document.addEventListener('DOMContentLoaded', function() {
    const perfilBtn = document.getElementById('perfilBtn');
    const cerrarBtn = document.getElementById('cerrarBtn');
    
    if (perfilBtn) perfilBtn.setAttribute('data-tooltip', 'Mi Perfil');
    if (cerrarBtn) cerrarBtn.setAttribute('data-tooltip', 'Cerrar Sesión');
});

// Ajustar escala en dispositivos móviles
document.addEventListener('DOMContentLoaded', function() {
    function adjustMobileScale() {
        // Reducir el contenido para evitar zoom excesivo
        if (window.innerWidth <= 768) {
            const introSection = document.querySelector('.intro-section');
            const appDescription = document.querySelector('.app-description');
            
            if (introSection) introSection.style.fontSize = '0.95rem';
            if (appDescription) {
                appDescription.style.fontSize = '0.95rem';
                appDescription.style.width = '100%';
            }
        }
    }
    
    // Ejecutar al cargar y al cambiar tamaño
    adjustMobileScale();
    window.addEventListener('resize', adjustMobileScale);
});

// Funciones para la sección de desafíos y cupones
function filtrarDesafios() {
    const filtro = document.getElementById('filter-challenge').value;
    const desafios = document.querySelectorAll('.challenge-card');
    
    desafios.forEach(desafio => {
        if (filtro === 'todos' || desafio.dataset.difficulty === filtro) {
            desafio.style.display = 'block';
        } else {
            desafio.style.display = 'none';
        }
    });
}

// Funciones para videos educativos
function abrirVideo(videoId, titulo, descripcion) {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoIframe');
    const videoTitle = document.getElementById('videoTitle');
    const videoDescription = document.getElementById('videoDescription');
    
    // Configurar el iframe con el video
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    
    // Actualizar título y descripción
    videoTitle.textContent = titulo;
    videoDescription.textContent = descripcion;
    
    // Mostrar el modal
    modal.style.display = 'flex';
    
    // Prevenir scroll en el body
    document.body.style.overflow = 'hidden';
}

function cerrarVideo() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoIframe');
    
    // Detener el video
    iframe.src = '';
    
    // Ocultar el modal
    modal.style.display = 'none';
    
    // Restaurar scroll en el body
    document.body.style.overflow = 'auto';
}

function filtrarVideos(categoria) {
    const videos = document.querySelectorAll('.video-card');
    const filtros = document.querySelectorAll('.video-filter');
    
    // Actualizar botones de filtro
    filtros.forEach(filtro => {
        if (filtro.textContent.toLowerCase().includes(categoria) || 
            (filtro.textContent.toLowerCase() === 'todos' && categoria === 'todos')) {
            filtro.classList.add('active');
        } else {
            filtro.classList.remove('active');
        }
    });
    
    // Filtrar videos
    videos.forEach(video => {
        if (categoria === 'todos' || video.dataset.category === categoria) {
            video.style.display = 'block';
        } else {
            video.style.display = 'none';
        }
    });
}

// Cerrar el modal de video al hacer clic fuera del contenido
window.addEventListener('click', function(event) {
    const modal = document.getElementById('videoModal');
    if (event.target === modal) {
        cerrarVideo();
    }
});

// Cerrar el modal de video con la tecla ESC
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        cerrarVideo();
    }
});

function filtrarCupones() {
    const filtro = document.getElementById('filter-coupon').value;
    let cupones = Array.from(document.querySelectorAll('.coupon-card'));
    const container = document.getElementById('cupones-container');
    const tiendasFilter = document.getElementById('tiendas-filter');
    
    // Mostrar u ocultar el filtro de tiendas
    if (filtro === 'tiendas') {
        tiendasFilter.style.display = 'block';
        return; // No hacemos más cambios, esperamos que el usuario seleccione una tienda
    } else {
        tiendasFilter.style.display = 'none';
    }
    
    switch(filtro) {
        case 'menor':
            cupones.sort((a, b) => parseInt(a.dataset.puntos) - parseInt(b.dataset.puntos));
            break;
        case 'mayor':
            cupones.sort((a, b) => parseInt(b.dataset.puntos) - parseInt(a.dataset.puntos));
            break;
        case 'fecha':
            cupones.sort((a, b) => new Date(a.dataset.expiracion) - new Date(b.dataset.expiracion));
            break;
    }
    
    container.innerHTML = '';
    cupones.forEach(cupon => container.appendChild(cupon));
}

function filtrarPorTienda(tienda) {
    const cupones = Array.from(document.querySelectorAll('.coupon-card'));
    const container = document.getElementById('cupones-container');
    
    container.innerHTML = '';
    
    if (tienda === 'todas') {
        cupones.forEach(cupon => container.appendChild(cupon));
    } else {
        const cuponesFiltrados = cupones.filter(cupon => cupon.dataset.tienda === tienda);
        
        if (cuponesFiltrados.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>No se encontraron cupones para ${tienda}.</p>
                </div>
            `;
        } else {
            cuponesFiltrados.forEach(cupon => container.appendChild(cupon));
        }
    }
    
    // Resaltar el botón seleccionado
    document.querySelectorAll('#tiendas-filter .btn').forEach(btn => {
        if (btn.textContent === tienda || (btn.textContent === 'Todas' && tienda === 'todas')) {
            btn.style.boxShadow = '0 0 0 2px white';
            btn.style.transform = 'scale(1.05)';
        } else {
            btn.style.boxShadow = 'none';
            btn.style.transform = 'none';
        }
    });
}

function canjearCreditos(tipo, costo) {
    const creditsElement = document.getElementById('user-credits');
    let credits = parseInt(creditsElement.textContent);
    
    if (credits >= costo) {
        if (confirm(`¿Confirmar canje de ${costo} créditos para: ${tipo}?`)) {
            credits -= costo;
            creditsElement.textContent = credits;
            
            const usuario = JSON.parse(localStorage.getItem('usuario_actual'));
            if (usuario) {
                usuario.creditos = credits;
                localStorage.setItem('usuario_actual', JSON.stringify(usuario));
                
                // Actualizar en la lista de usuarios
                let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                const index = usuarios.findIndex(u => u.email === usuario.email);
                if (index !== -1) {
                    usuarios[index] = usuario;
                    localStorage.setItem('usuarios', JSON.stringify(usuarios));
                }
            }
            
            alert(`¡Canje realizado con éxito! Has contribuido a: ${tipo}`);
        }
    } else {
        alert('No tienes suficientes créditos para realizar este canje.');
    }
}

// Función para contactar como patrocinador
function contactarPatrocinio() {
    // Crear modal para formulario de patrocinio
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 class="modal-title">Conviértete en Patrocinador</h3>
                <button class="close-modal" onclick="cerrarModalPatrocinio()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <p style="margin-bottom: 1.5rem; color: #64748b;">
                Gracias por tu interés en apoyar nuestras iniciativas ambientales. Complete el formulario y nuestro equipo se pondrá en contacto contigo para discutir las opciones de patrocinio.
            </p>
            
            <form id="formPatrocinio" onsubmit="enviarFormularioPatrocinio(event)">
                <div class="form-group">
                    <label for="empresaNombre">Nombre de la Empresa</label>
                    <input type="text" id="empresaNombre" required>
                </div>
                
                <div class="form-group">
                    <label for="contactoNombre">Nombre de Contacto</label>
                    <input type="text" id="contactoNombre" required>
                </div>
                
                <div class="form-group">
                    <label for="contactoEmail">Email de Contacto</label>
                    <input type="email" id="contactoEmail" required>
                </div>
                
                <div class="form-group">
                    <label for="contactoTelefono">Teléfono</label>
                    <input type="tel" id="contactoTelefono" required>
                </div>
                
                <div class="form-group">
                    <label for="nivelPatrocinio">Nivel de Patrocinio Interesado</label>
                    <select id="nivelPatrocinio" required>
                        <option value="">Seleccionar nivel</option>
                        <option value="Platino">Platino</option>
                        <option value="Oro">Oro</option>
                        <option value="Plata">Plata</option>
                        <option value="Bronce">Bronce</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="comentarios">Comentarios Adicionales</label>
                    <textarea id="comentarios" rows="4" style="width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: var(--border-radius); font-size: 1rem; resize: vertical;"></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary" style="margin-top: 1rem; width: 100%;">
                    <i class="fas fa-paper-plane"></i>
                    Enviar Solicitud
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Prevenir scroll en el body
    document.body.style.overflow = 'hidden';
}

function cerrarModalPatrocinio() {
    const modal = document.querySelector('.modal');
    if (modal) {
        document.body.removeChild(modal);
        // Restaurar scroll en el body
        document.body.style.overflow = 'auto';
    }
}

function enviarFormularioPatrocinio(event) {
    event.preventDefault();
    
    const empresa = document.getElementById('empresaNombre').value;
    const contacto = document.getElementById('contactoNombre').value;
    const email = document.getElementById('contactoEmail').value;
    const telefono = document.getElementById('contactoTelefono').value;
    const nivel = document.getElementById('nivelPatrocinio').value;
    
    // Aquí se podría implementar el envío real de los datos a un servidor
    // Por ahora, solo mostraremos un mensaje de éxito
    
    // Guardar solicitud en localStorage para demostración
    const solicitud = {
        empresa,
        contacto,
        email,
        telefono,
        nivel,
        comentarios: document.getElementById('comentarios').value,
        fecha: new Date().toISOString()
    };
    
    let solicitudes = JSON.parse(localStorage.getItem('solicitudes_patrocinio') || '[]');
    solicitudes.push(solicitud);
    localStorage.setItem('solicitudes_patrocinio', JSON.stringify(solicitudes));
    
    // Cerrar el modal
    cerrarModalPatrocinio();
    
    // Mostrar mensaje de éxito
    mostrarNotificacion(`¡Gracias por tu interés! Hemos recibido la solicitud de ${empresa} y nos pondremos en contacto pronto.`);
}

// Función para volver a la página de inicio al hacer clic en el logo
function volverInicio() {
    const usuarioActual = localStorage.getItem("usuario_actual");
    
    if (usuarioActual) {
        // Si hay un usuario logueado, mostrar su dashboard
        document.querySelector('.intro-section').style.display = 'none';
        document.getElementById("registro").style.display = "none";
        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";
        mostrarSeccion('progreso');
    } else {
        // Si no hay usuario logueado, mostrar la página de inicio
        document.querySelector('.intro-section').style.display = 'block';
        document.getElementById("auth-nav").style.display = "flex";
        document.getElementById("registro").style.display = "none";
        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "none";
        document.getElementById("main-nav").style.display = "none";
        document.getElementById("mobile-nav").style.display = "none";
        
        // Hacer scroll al inicio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Reiniciar el carrusel
        slideActual = 0;
        actualizarCarrusel();
        
        // Aplicar estilos específicos para botones en modo móvil
        if (window.innerWidth <= 768) {
            const authNav = document.getElementById('auth-nav');
            authNav.style.flexDirection = 'row';
            authNav.style.justifyContent = 'flex-end';
            authNav.style.flex = '0 0 auto';
            
            // Aplicar estilos a los botones
            const buttons = authNav.querySelectorAll('.btn');
            buttons.forEach(btn => {
                const text = btn.querySelector('.btn-text');
                if (text) text.style.display = 'none';
                
                btn.style.width = '40px';
                btn.style.height = '40px';
                btn.style.padding = '0';
                btn.style.borderRadius = '50%';
                btn.style.minWidth = '40px';
            });
        }
    }
}

function cerrarBienvenida() {
    const overlay = document.getElementById("welcomeOverlay");
    overlay.style.animation = "fadeOut 0.5s ease forwards";
    
    // Marcar como mostrado para no volver a mostrar en esta sesión
    localStorage.setItem("bienvenida_mostrada", "true");
    
    // Eliminar el overlay después de la animación
    setTimeout(() => {
        overlay.style.display = "none";
        overlay.style.animation = "";
    }, 500);
}

function mostrarBienvenida(tipo, nombre = "") {
    const overlay = document.getElementById("welcomeOverlay");
    const titulo = overlay.querySelector(".welcome-title");
    const texto = overlay.querySelector(".welcome-text");
    const boton = overlay.querySelector(".welcome-button");
    
    // Personalizar el mensaje según el tipo
    switch(tipo) {
        case "registro":
            titulo.textContent = `¡Bienvenido a Econnect, ${nombre}!`;
            texto.textContent = "Gracias por unirte a nuestra comunidad. Tu viaje hacia un estilo de vida más sostenible comienza ahora. Completa desafíos, gana puntos y contribuye a un planeta más verde.";
            boton.textContent = "Comenzar mi aventura";
            break;
            
        case "login":
            titulo.textContent = `¡Hola de nuevo, ${nombre}!`;
            texto.textContent = "Nos alegra verte de vuelta. Continúa con tus desafíos ambientales y sigue haciendo la diferencia en nuestro planeta.";
            boton.textContent = "Continuar mi viaje";
            break;
            
        default: // visitante
            titulo.textContent = "¡Bienvenido a Econnect!";
            texto.textContent = "Descubre cómo pequeñas acciones pueden generar un gran impacto en nuestro planeta. Únete a nuestra comunidad comprometida con el medio ambiente.";
            boton.textContent = "Explorar";
    }
    
    // Mostrar el overlay con animación
    overlay.style.display = "flex";
    
    // No marcar como mostrado para visitantes (se hará al cerrar)
    // Para login y registro, marcar inmediatamente
    if (tipo !== "visitante") {
        localStorage.setItem("bienvenida_mostrada", "true");
    }
}

function toggleInfo(id) {
    // Eliminando función toggleInfo
}

function mostrarMensaje(mensaje, tipo = "info") {
    // Crear elemento de notificación
    const notificacion = document.createElement("div");
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Mostrar con animación
    setTimeout(() => {
        notificacion.classList.add("show");
    }, 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

// Banco de quizzes para cada desafío
const bancoDeQuizzes = [
    // Desafíos iniciales (1-5)
    {
        desafioId: 1,
        titulo: "Quiz: Reciclaje de plásticos",
        pdfUrl: "https://drive.google.com/file/d/1sAq8GJBaH7gYPWpB7mQ6Fhm5KRX7ZqJR/preview",
        preguntas: [
            {
                pregunta: "¿Cuál de los siguientes plásticos es más difícil de reciclar?",
                opciones: [
                    "PET (botellas de agua)",
                    "HDPE (botellas de detergente)",
                    "PVC (tuberías y cables)",
                    "PP (tapas de botellas)"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Qué porcentaje aproximado de plástico se recicla a nivel mundial?",
                opciones: [
                    "Menos del 10%",
                    "Entre 10% y 25%",
                    "Entre 25% y 50%",
                    "Más del 50%"
                ],
                respuestaCorrecta: 0
            },
            {
                pregunta: "¿Cuánto tiempo tarda aproximadamente una botella de plástico en descomponerse?",
                opciones: [
                    "10-20 años",
                    "50-100 años",
                    "100-450 años",
                    "500-1000 años"
                ],
                respuestaCorrecta: 2
            }
        ]
    },
    {
        desafioId: 2,
        titulo: "Quiz: Plantación de árboles",
        pdfUrl: "https://drive.google.com/file/d/1sL9XR9F9Ci_EoUQ6xRGkxJlwMQvNi6G3/preview",
        preguntas: [
            {
                pregunta: "¿Cuál es el beneficio principal de plantar árboles?",
                opciones: [
                    "Absorben dióxido de carbono",
                    "Proporcionan sombra",
                    "Dan frutos",
                    "Embellecen el paisaje"
                ],
                respuestaCorrecta: 0
            },
            {
                pregunta: "¿Cuántos árboles se necesitan plantar para compensar la huella de carbono anual de una persona promedio?",
                opciones: [
                    "1-5 árboles",
                    "7-15 árboles",
                    "20-30 árboles",
                    "Más de 50 árboles"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Cuál de las siguientes especies de árboles absorbe más CO2?",
                opciones: [
                    "Pino",
                    "Encino/Roble",
                    "Eucalipto",
                    "Álamo"
                ],
                respuestaCorrecta: 2
            }
        ]
    },
    {
        desafioId: 3,
        titulo: "Quiz: Transporte sostenible",
        pdfUrl: "https://drive.google.com/file/d/1sGhYdW63HbTmD_fIGKOYFaGZTxg-ZJqI/preview",
        preguntas: [
            {
                pregunta: "¿Qué porcentaje de las emisiones de gases de efecto invernadero proviene del transporte?",
                opciones: [
                    "Menos del 5%",
                    "10-15%",
                    "20-25%",
                    "Más del 30%"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Cuál de los siguientes medios de transporte es más eficiente energéticamente?",
                opciones: [
                    "Automóvil eléctrico",
                    "Bicicleta",
                    "Autobús público",
                    "Tren"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Cuál es una desventaja significativa de los vehículos eléctricos actualmente?",
                opciones: [
                    "Baja velocidad máxima",
                    "Bajo rendimiento en carretera",
                    "Tiempo de recarga prolongado",
                    "Mayor consumo de combustible"
                ],
                respuestaCorrecta: 2
            }
        ]
    },
    {
        desafioId: 4,
        titulo: "Quiz: Jardines comunitarios",
        pdfUrl: "https://drive.google.com/file/d/1sLdjw9UYTR4fLl5MTc1BwxEd6mJLJbKf/preview",
        preguntas: [
            {
                pregunta: "¿Cuál es un beneficio social de los jardines comunitarios?",
                opciones: [
                    "Generan ingresos significativos",
                    "Fortalecen el sentido de comunidad",
                    "Eliminan la necesidad de parques públicos",
                    "Reducen los impuestos municipales"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Qué práctica es recomendable en un jardín comunitario sostenible?",
                opciones: [
                    "Uso intensivo de fertilizantes químicos",
                    "Plantar una sola especie de cultivo",
                    "Compostaje de residuos orgánicos",
                    "Riego abundante diariamente"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "Los huertos urbanos contribuyen a mitigar el efecto isla de calor porque:",
                opciones: [
                    "Reflejan la luz solar",
                    "Aumentan la humedad relativa",
                    "Crean sombra sobre el asfalto",
                    "Todas las anteriores"
                ],
                respuestaCorrecta: 3
            }
        ]
    },
    {
        desafioId: 5,
        titulo: "Quiz: Reducción de consumo de agua",
        pdfUrl: "https://drive.google.com/file/d/1sFBj-QFu6GMUmFlxmWZjnJULoAZbJCMI/preview",
        preguntas: [
            {
                pregunta: "¿Cuánta agua se desperdicia aproximadamente por una fuga de goteo en un grifo?",
                opciones: [
                    "1-2 litros al día",
                    "5-10 litros al día",
                    "15-20 litros al día",
                    "Más de 20 litros al día"
                ],
                respuestaCorrecta: 3
            },
            {
                pregunta: "¿Qué actividad doméstica consume más agua en un hogar promedio?",
                opciones: [
                    "Lavar los platos",
                    "Ducharse",
                    "Tirar de la cadena del inodoro",
                    "Regar el jardín"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Cuál de las siguientes acciones NO contribuye significativamente al ahorro de agua?",
                opciones: [
                    "Cerrar el grifo mientras te cepillas los dientes",
                    "Usar lavavajillas en lugar de lavar a mano",
                    "Ducharse en lugar de bañarse",
                    "Hervir el agua antes de usarla"
                ],
                respuestaCorrecta: 3
            }
        ]
    },
    // Desafíos adicionales
    {
        desafioId: 101,
        titulo: "Quiz: Limpieza de playas",
        pdfUrl: "https://drive.google.com/file/d/1sLdj-QHdRvTfJeGMWmfghjkLLsdYFRmH/preview",
        preguntas: [
            {
                pregunta: "¿Cuál es el tipo de basura más común encontrado en limpiezas de playa?",
                opciones: [
                    "Botellas de vidrio",
                    "Colillas de cigarrillos",
                    "Bolsas de plástico",
                    "Latas de aluminio"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Cuánto tiempo tarda una colilla de cigarrillo en degradarse en el ambiente?",
                opciones: [
                    "1-2 meses",
                    "1-2 años",
                    "5-10 años",
                    "Más de 10 años"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Qué porcentaje de la basura marina proviene de actividades terrestres?",
                opciones: [
                    "Menos del 20%",
                    "Entre 20% y 50%",
                    "Entre 50% y 80%",
                    "Más del 80%"
                ],
                respuestaCorrecta: 3
            }
        ]
    }
    // Puedes agregar más quizzes para el resto de desafíos...
];

// Variables para el quiz actual
let quizActual = null;
let respuestasUsuario = [];

// Función para cerrar el modal de quiz
function cerrarModalQuiz() {
    document.getElementById("quizModal").style.display = "none";
    
    // Resetear el estado del quiz
    quizActual = null;
    respuestasUsuario = [];
    
    // Ocultar resultados y mostrar preguntas para el próximo quiz
    document.getElementById("quizQuestions").style.display = "block";
    document.getElementById("quizResults").style.display = "none";
    document.getElementById("submitQuiz").style.display = "block";
}

// Función para mostrar el quiz después de completar un desafío
function mostrarQuiz(desafioId, titulo) {
    // Buscar el quiz correspondiente al desafío
    const quiz = bancoDeQuizzes.find(q => q.desafioId === desafioId);
    
    // Si no hay quiz para este desafío, no hacer nada
    if (!quiz) {
        console.log("No se encontró quiz para el desafío ID:", desafioId);
        return;
    }
    
    quizActual = quiz;
    respuestasUsuario = new Array(quiz.preguntas.length).fill(-1);
    
    // Actualizar título del quiz
    document.getElementById("quizTitulo").textContent = quiz.titulo;
    
    // Cargar PDF si existe
    const pdfViewer = document.getElementById("pdfViewer");
    const pdfPlaceholder = pdfViewer.querySelector(".pdf-placeholder");
    const pdfFrame = document.getElementById("pdfFrame");
    
    if (quiz.pdfUrl) {
        pdfFrame.src = quiz.pdfUrl;
        pdfFrame.style.display = "block";
        pdfPlaceholder.style.display = "none";
    } else {
        pdfFrame.style.display = "none";
        pdfPlaceholder.style.display = "flex";
        pdfPlaceholder.innerHTML = `
            <i class="fas fa-file-pdf"></i>
            <span>No hay material educativo disponible para este desafío.</span>
        `;
    }
    
    // Generar preguntas
    const questionsContainer = document.getElementById("quizQuestions");
    questionsContainer.innerHTML = "";
    
    quiz.preguntas.forEach((pregunta, preguntaIndex) => {
        const questionElement = document.createElement("div");
        questionElement.className = "quiz-question";
        
        const questionText = document.createElement("div");
        questionText.className = "question-text";
        questionText.textContent = `${preguntaIndex + 1}. ${pregunta.pregunta}`;
        
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "question-options";
        
        pregunta.opciones.forEach((opcion, opcionIndex) => {
            const optionItem = document.createElement("label");
            optionItem.className = "option-item";
            
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `pregunta-${preguntaIndex}`;
            radio.className = "option-radio";
            radio.value = opcionIndex;
            radio.addEventListener("change", () => {
                respuestasUsuario[preguntaIndex] = opcionIndex;
            });
            
            const optionText = document.createElement("span");
            optionText.className = "option-text";
            optionText.textContent = opcion;
            
            optionItem.appendChild(radio);
            optionItem.appendChild(optionText);
            optionsContainer.appendChild(optionItem);
        });
        
        questionElement.appendChild(questionText);
        questionElement.appendChild(optionsContainer);
        questionsContainer.appendChild(questionElement);
    });
    
    // Mostrar el botón de enviar respuestas
    document.getElementById("submitQuiz").style.display = "block";
    // Ocultar los resultados
    document.getElementById("quizResults").style.display = "none";
    // Mostrar las preguntas
    document.getElementById("quizQuestions").style.display = "block";
    
    // Mostrar el modal
    document.getElementById("quizModal").style.display = "block";
}

// Función para evaluar el quiz
function evaluarQuiz() {
    if (!quizActual) return;
    
    // Verificar si todas las preguntas están respondidas
    const sinResponder = respuestasUsuario.some(r => r === -1);
    if (sinResponder) {
        alert("Por favor, responde todas las preguntas antes de enviar.");
        return;
    }
    
    // Calcular puntuación
    let puntosObtenidos = 0;
    respuestasUsuario.forEach((respuesta, index) => {
        if (respuesta === quizActual.preguntas[index].respuestaCorrecta) {
            puntosObtenidos++;
        }
    });
    
    // Mostrar resultados
    const resultadosContainer = document.getElementById("quizResults");
    document.getElementById("quizScore").textContent = `${puntosObtenidos}/${quizActual.preguntas.length}`;
    
    // Determinar mensaje según puntuación
    const porcentajeAcierto = (puntosObtenidos / quizActual.preguntas.length) * 100;
    let mensaje = "";
    let puntosExtra = 0;
    
    if (porcentajeAcierto === 100) {
        mensaje = "¡Excelente! Has respondido correctamente todas las preguntas. Recibirás 30 puntos extra.";
        puntosExtra = 30;
    } else if (porcentajeAcierto >= 70) {
        mensaje = "¡Muy bien! Has respondido correctamente la mayoría de las preguntas. Recibirás 20 puntos extra.";
        puntosExtra = 20;
    } else if (porcentajeAcierto >= 50) {
        mensaje = "¡Bien! Has aprobado el quiz. Recibirás 10 puntos extra.";
        puntosExtra = 10;
    } else {
        mensaje = "Has completado el quiz, pero necesitas reforzar tus conocimientos sobre este tema. No recibirás puntos extra esta vez.";
        puntosExtra = 0;
    }
    
    document.getElementById("resultMessage").textContent = mensaje;
    
    // Marcar respuestas correctas e incorrectas
    const questionsContainer = document.getElementById("quizQuestions");
    const questionElements = questionsContainer.querySelectorAll(".quiz-question");
    
    questionElements.forEach((questionElement, questionIndex) => {
        const optionItems = questionElement.querySelectorAll(".option-item");
        const respuestaCorrecta = quizActual.preguntas[questionIndex].respuestaCorrecta;
        
        optionItems.forEach((optionItem, optionIndex) => {
            if (optionIndex === respuestaCorrecta) {
                optionItem.classList.add("correct-answer");
            } else if (optionIndex === respuestasUsuario[questionIndex] && respuestasUsuario[questionIndex] !== respuestaCorrecta) {
                optionItem.classList.add("wrong-answer");
            }
            
            // Deshabilitar los inputs
            const radio = optionItem.querySelector("input");
            if (radio) radio.disabled = true;
        });
    });
    
    // Actualizar puntos del usuario
    if (puntosExtra > 0) {
        const usuario = JSON.parse(localStorage.getItem('usuario_actual'));
        usuario.puntos += puntosExtra;
        
        // Actualizar nivel si es necesario
        if (usuario.puntos >= 100) {
            usuario.nivel++;
            usuario.puntos -= 100;
            mostrarNotificacion(`¡Felicidades! Has subido al nivel ${usuario.nivel}.`);
        }
        
        localStorage.setItem('usuario_actual', JSON.stringify(usuario));
        
        // Actualizar en lista de usuarios
        let usuarios = JSON.parse(localStorage.getItem('usuarios'));
        const index = usuarios.findIndex(u => u.email === usuario.email);
        if (index !== -1) {
            usuarios[index] = usuario;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }
        
        // Actualizar nivel en la UI
        document.getElementById('nivel-badge').textContent = `Nivel ${usuario.nivel}`;
        
        // Mostrar notificación
        mostrarNotificacion(`Has ganado ${puntosExtra} puntos extra por completar el quiz.`);
    }
    
    // Ocultar botón de enviar y mostrar resultados
    document.getElementById("submitQuiz").style.display = "none";
    resultadosContainer.style.display = "block";
}    