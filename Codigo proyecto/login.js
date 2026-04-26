document.getElementById('btn-entrar').addEventListener('click', async () => {
    const usuario = document.getElementById('user').value;
    const contrasena = document.getElementById('pass').value;

    if (!usuario || !contrasena) {
        alert("Por favor, completa todos los campos");
        return;
    }

    try {
        const respuesta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: usuario, password: contrasena })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            // Guardamos el nombre en el almacenamiento del navegador para usarlo en el dashboard
            localStorage.setItem('usuarioNombre', data.usuario);
            window.location.href = "dashboard.html";
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor");
    }
});