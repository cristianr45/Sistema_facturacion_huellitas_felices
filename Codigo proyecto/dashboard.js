if (!localStorage.getItem('usuarioNombre')) {
    alert("Acceso denegado. Por favor inicia sesión.");
    window.location.href = "login.html";
}

const contentDiv = document.getElementById('dynamic-content');
let carritoServicios = []; 

function updateContent(title, description, formHtml = "") {
    contentDiv.innerHTML = `
        <h2>${title}</h2>
        <p>${description}</p>
        <div class="form-container">
            ${formHtml}
        </div>
    `;
}

// 1. Módulo de Clientes
document.getElementById('btn-clientes').addEventListener('click', () => {
    const form = `
        <div class="form-grid">
            <h4>Datos del Propietario</h4>
            <input type="text" id="cli-nombre" placeholder="Nombre" class="input-form">
            <input type="text" id="cli-apellido" placeholder="Apellido" class="input-form">
            <input type="text" id="cli-cedula" placeholder="Cédula" class="input-form">
            <input type="text" id="cli-tel" placeholder="Teléfono" class="input-form">
            <hr style="grid-column: span 2;">
            <h4>Datos de la Mascota</h4>
            <input type="text" id="mas-nombre" placeholder="Nombre Mascota" class="input-form">
            <input type="text" id="mas-especie" placeholder="Especie" class="input-form">
            <input type="text" id="mas-raza" placeholder="Raza" class="input-form">
            <input type="number" id="mas-edad" placeholder="Edad" class="input-form">
        </div>
        <button class="btn-save" onclick="enviarDatosMySQL('ClienteMascota')">Registrar en Base de Datos</button>
    `;
    updateContent("Registro de Clientes", "Gestión de propietarios y mascotas en Huellitas Felices.", form);
});

// 2. Módulo de Empleados
document.getElementById('btn-empleados').addEventListener('click', () => {
    const form = `
        <div class="form-grid">
            <h4>Datos del Nuevo Colaborador</h4>
            <input type="text" id="emp-nombre" placeholder="Nombre Completo" class="input-form">
            <input type="text" id="emp-usuario" placeholder="Nombre de Usuario" class="input-form">
            <input type="password" id="emp-pass" placeholder="Contraseña" class="input-form">
        </div>
        <button class="btn-save" onclick="enviarDatosMySQL('Empleado')">Registrar Empleado</button>
    `;
    updateContent("Gestión de Empleados", "Registro de nuevos colaboradores para el acceso al sistema.", form);
});

// 3. Módulo de Servicios
document.getElementById('btn-servicios').addEventListener('click', async () => {
    const form = `
        <div class="form-grid">
            <h4>Nuevo Servicio al Catálogo</h4>
            <input type="text" id="ser-codigo" placeholder="Código (Ej: PELU01)" class="input-form">
            <input type="text" id="ser-desc" placeholder="Descripción del servicio" class="input-form">
            <input type="number" id="ser-precio" placeholder="Precio ($)" class="input-form">
        </div>
        <button class="btn-save" onclick="enviarDatosMySQL('Servicio')">Guardar Servicio</button>
        
        <div style="margin-top: 30px; grid-column: span 2;">
            <h4>Servicios en Base de Datos</h4>
            <table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #ddd;">
                <thead>
                    <tr style="background: #eee;">
                        <th style="padding: 8px; text-align: left;">Código</th>
                        <th style="padding: 8px; text-align: left;">Descripción</th>
                        <th style="padding: 8px; text-align: right;">Precio</th>
                    </tr>
                </thead>
                <tbody id="cuerpo-tabla-servicios"></tbody>
            </table>
        </div>
    `;
    updateContent("Portafolio de Servicios", "Ingresa nuevos servicios y consulta el catálogo actual.", form);
    cargarTablaServicios();
});

// 4. Módulo de Facturación
document.getElementById('btn-facturacion').addEventListener('click', () => {
    carritoServicios = []; 
    const form = `
        <div class="form-grid">
            <label>Cédula Cliente:</label>
            <input type="text" id="fac-cliente" placeholder="Cédula para la factura..." class="input-form">
            <hr style="grid-column: span 2;">
            <label>Servicio:</label>
            <div style="display: flex; gap: 10px;">
                <select id="fac-servicio-select" class="input-form">
                    <option value="" data-precio="0">Seleccione...</option>
                    <option value="CONS01" data-precio="50000">Consulta - $50.000</option>
                    <option value="VACU01" data-precio="35000">Vacuna - $35.000</option>
                    <option value="PELU01" data-precio="45000">Peluquería - $45.000</option>
                </select>
                <button type="button" class="btn-save" onclick="agregarAlCarrito()" style="background: #2ecc71;">+</button>
            </div>
            <div style="grid-column: span 2; margin-top: 15px;">
                <table style="width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #ddd;">
                    <thead>
                        <tr style="background: #eee;">
                            <th style="padding: 8px; text-align: left;">Servicio</th>
                            <th style="padding: 8px; text-align: right;">Precio</th>
                        </tr>
                    </thead>
                    <tbody id="cuerpo-tabla-factura"></tbody>
                </table>
            </div>
            <label>Total:</label>
            <input type="text" id="total-final" value="$ 0" class="input-form" readonly>
        </div>
        <button class="btn-save" onclick="enviarDatosMySQL('Factura')">Pagar y Generar PDF</button>
    `;
    updateContent("Facturación", "Módulo de salida de información y generación de recibos.", form);
});

// --- LÓGICA DE INTEGRACIÓN (FETCH) ---

async function enviarDatosMySQL(tipo) {
    if (tipo === 'ClienteMascota') {
        const payload = {
            cliente: {
                nombre: document.getElementById('cli-nombre').value,
                apellido: document.getElementById('cli-apellido').value,
                cedula_id: document.getElementById('cli-cedula').value,
                telefono: document.getElementById('cli-tel').value
            },
            mascota: {
                nombre_mascota: document.getElementById('mas-nombre').value,
                especie: document.getElementById('mas-especie').value,
                raza: document.getElementById('mas-raza').value,
                edad_anios: document.getElementById('mas-edad').value
            }
        };
        ejecutarFetch('http://localhost:3000/api/registrar-cliente', payload);
    }

    if (tipo === 'Empleado') {
        const payload = {
            nombre: document.getElementById('emp-nombre').value,
            usuario: document.getElementById('emp-usuario').value,
            password: document.getElementById('emp-pass').value
        };
        ejecutarFetch('http://localhost:3000/api/registrar-empleado', payload);
    }

    if (tipo === 'Servicio') {
        const payload = {
            codigo: document.getElementById('ser-codigo').value,
            descripcion: document.getElementById('ser-desc').value,
            precio: document.getElementById('ser-precio').value
        };
        ejecutarFetch('http://localhost:3000/api/registrar-servicio', payload);
    }

    if (tipo === 'Factura') {
        if (carritoServicios.length === 0) return mostrarNotificacion("Carrito Vacío", "Agregue servicios.", "alerta");
        generarPDF();
    }
}

async function ejecutarFetch(url, datos) {
    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await respuesta.json();

        if (respuesta.ok) {
            mostrarNotificacion("¡Éxito!", data.mensaje, "exito");
            document.querySelectorAll('.input-form').forEach(input => input.value = "");
            
            // Refrescar tabla si estamos en el módulo de servicios
            if (document.getElementById('cuerpo-tabla-servicios')) {
                cargarTablaServicios();
            }
        } else {
            mostrarNotificacion("Error", data.error || "Problema técnico", "error");
        }
    } catch (error) {
        mostrarNotificacion("Error", "Sin conexión con el servidor", "error");
    }
}

// --- TABLA DINÁMICA SERVICIOS ---
async function cargarTablaServicios() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/servicios');
        const servicios = await respuesta.json();
        const cuerpo = document.getElementById('cuerpo-tabla-servicios');
        if (!cuerpo) return;

        cuerpo.innerHTML = "";
        servicios.forEach(s => {
            cuerpo.innerHTML += `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.codigo_sp}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.descripcion}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$ ${parseFloat(s.precio_venta).toLocaleString()}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar servicios:", error);
    }
}

// --- FUNCIONES AUXILIARES (Facturación y Notificaciones) ---

function agregarAlCarrito() {
    const select = document.getElementById('fac-servicio-select');
    const option = select.options[select.selectedIndex];
    if (select.value === "") return;

    carritoServicios.push({ 
        nombre: option.text.split(' - ')[0], 
        precio: parseInt(option.getAttribute('data-precio')) 
    });

    const cuerpo = document.getElementById('cuerpo-tabla-factura');
    cuerpo.innerHTML = "";
    let total = 0;
    carritoServicios.forEach(s => {
        cuerpo.innerHTML += `<tr><td style="padding: 8px;">${s.nombre}</td><td style="text-align: right;">$ ${s.precio.toLocaleString()}</td></tr>`;
        total += s.precio;
    });
    document.getElementById('total-final').value = "$ " + total.toLocaleString();
}

function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const cedula = document.getElementById('fac-cliente').value;
    const total = document.getElementById('total-final').value;

    doc.text("HUELLITAS FELICES - RECIBO", 105, 20, null, null, "center");
    doc.text(`Cédula: ${cedula}`, 20, 40);
    let y = 60;
    carritoServicios.forEach(s => {
        doc.text(`- ${s.nombre}: $${s.precio.toLocaleString()}`, 20, y);
        y += 10;
    });
    doc.text(`TOTAL: ${total}`, 20, y + 10);
    doc.save(`Factura_${cedula}.pdf`);
}

function mostrarNotificacion(titulo, mensaje, tipo = 'exito') {
    let icono = "✅"; let color = "#2ecc71";
    if (tipo === 'error') { icono = "❌"; color = "#e74c3c"; }
    else if (tipo === 'alerta') { icono = "⚠️"; color = "#f1c40f"; }

    const modalHtml = `
        <div id="modal-global" class="modal-overlay">
            <div class="modal-content">
                <div style="font-size: 60px;">${icono}</div>
                <h3 style="color: ${color};">${titulo}</h3>
                <p>${mensaje}</p>
                <button class="btn-modal" onclick="cerrarNotificacion()">Aceptar</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function cerrarNotificacion() {
    const modal = document.getElementById('modal-global');
    if (modal) modal.remove();
}

document.getElementById('btn-logout').addEventListener('click', () => {
    if(confirm("¿Desea salir?")) window.location.href = "login.html";
});