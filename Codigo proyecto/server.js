const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE TU BASE DE DATOS
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'cristian', 
    database: 'HuellitasFelices'  
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos de Huellitas Felices');
});

// ENDPOINT PARA REGISTRAR CLIENTE Y MASCOTA
app.post('/api/registrar-cliente', (req, res) => {
    const { cliente, mascota } = req.body;
    
    // Esto te ayudará a ver si los datos llegan vacíos o con nombres distintos
    console.log("Datos recibidos:", req.body);

    const sqlcliente = "INSERT INTO CLIENTE (nombre, apellido, cedula_id, telefono) VALUES (?, ?, ?, ?)";
    db.query(sqlcliente, [cliente.nombre, cliente.apellido, cliente.cedula_id, cliente.telefono], (err, result) => {
        if (err) {
            console.error("Error en Cliente:", err.message);
            return res.status(500).json({ error: err.message });
        }
        
        const id_cliente = result.insertId;
        const sqlmascota = "INSERT INTO MASCOTA (nombre_mascota, especie, raza, edad_anios, id_cliente) VALUES (?, ?, ?, ?, ?)";
        
        // REVISA AQUÍ: asegúrate que en dashboard.js sea 'edad_anios' o cámbialo a 'edad'
        const edad = mascota.edad_anios || mascota.edad_anios; 
        const nombreM = mascota.nombre_mascota || mascota.nombre;

        db.query(sqlmascota, [nombreM, mascota.especie, mascota.raza, edad, id_cliente], (err) => {
            if (err) {
                console.error("Error en Mascota:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ mensaje: "Registro guardado en MySQL con éxito" });
        });
    });
});

// ENDPOINT PARA REGISTRAR EMPLEADO
app.post('/api/registrar-empleado', (req, res) => {
    const { nombre, usuario, password } = req.body;
    const sql = "INSERT INTO EMPLEADO (nombre_completo, usuario, password) VALUES (?, ?, ?)";
    db.query(sql, [nombre, usuario, password], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ mensaje: "Empleado registrado correctamente" });
    });
});

// ENDPOINT PARA REGISTRAR SERVICIO
app.post('/api/registrar-servicio', (req, res) => {
    const { codigo, descripcion, precio } = req.body;
    const sql = "INSERT INTO SERVICIO_PRODUCTO (codigo_sp, descripcion, precio_venta) VALUES (?, ?, ?)";
    db.query(sql, [codigo, descripcion, precio], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ mensaje: "Servicio agregado al catálogo" });
    });
});

// ENDPOINT PARA EL LOGIN
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    
    const sql = "SELECT * FROM EMPLEADO WHERE usuario = ? AND password = ?";
    db.query(sql, [usuario, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error en el servidor" });
        }

        if (results.length > 0) {
            // Usuario encontrado
            res.status(200).json({ 
                mensaje: "Bienvenido al sistema",
                usuario: results[0].nombre_completo 
            });
        } else {
            // Usuario o contraseña incorrectos
            res.status(401).json({ error: "Credenciales inválidas" });
        }
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});