const botonSwitch = document.getElementById("botonSwitch");
const valueDisplay = document.getElementById("valorSwitch");
const form = document.getElementById("formulario-login");
const errorDni = document.getElementById("error-dni");
const errorContra = document.getElementById("error-contra");
const loginError = document.getElementById("login-error");

// Lista de usuarios para la demostración
const usuarios = [
    { dni: "12345678A", contra: "1234", rol: "Paciente" },
    { dni: "12345678B", contra: "1234", rol: "Paciente" },
    { dni: "12345678Z", contra: "5678", rol: "Médico" },
    { dni: "12345678Y", contra: "5678", rol: "Médico" },

];

// Cambiar el valor del switch
botonSwitch.addEventListener("change", () => {
    valueDisplay.textContent = botonSwitch.checked ? "Médico" : "Paciente";
});

// Validar DNI cuando el campo pierde el foco
document.getElementById("dni").addEventListener("blur", () => {
    const dniInput = document.getElementById("dni");
    const dni = dniInput.value.trim().toUpperCase(); // Convertir a mayúsculas
    const dniRegex = /^[0-9]{8}[A-Z]$/; // Solo se requiere [A-Z] porque siempre trabajaremos con mayúsculas
    
    errorDni.textContent = dniRegex.test(dni) ? "" : "DNI no válido";
});

// Validar el formulario al enviarlo
form.addEventListener("submit", (event) => {
    event.preventDefault(); // Evita el envío del formulario

    const dniInput = document.getElementById("dni");
    const dni = dniInput.value.trim().toUpperCase(); // Convertir a mayúsculas el DNI ingresado
    const contra = document.getElementById("contra").value;
    const rol = botonSwitch.checked ? "Médico" : "Paciente";

    // Buscar el usuario en la lista
    const usuario = usuarios.find(user => 
        user.dni.toUpperCase() === dni && user.rol === rol // Convertir el DNI en el array a mayúsculas
    );

    if (!usuario) {
        loginError.textContent = `No se encontró el usuario`;
        return;
    }

    if (usuario.contra !== contra) {
        loginError.textContent = "Contraseña incorrecta.";
        return;
    }

    // Redirigir a la página correspondiente
    if (usuario.rol === "Paciente") {
        window.location.href = `html/paciente.html?dni=${dni}`;
    } else if (usuario.rol === "Médico") {
        window.location.href = `html/medico.html?dni=${dni}`;
    }
});




// Valide el inicio de sesión contra la base de datos
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const dni = document.getElementById("dni").value.trim().toUpperCase();
    const contra = document.getElementById("contra").value;
    const rol = botonSwitch.checked ? "Médico" : "Paciente";

    fetch('login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            dni: dni,
            contra: contra,
            rol: rol
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.rol === "Paciente") {
                window.location.href = `html/paciente.html?dni=${dni}`;
            } else {
                window.location.href = `html/medico.html?dni=${dni}`;
            }
        } else {
            loginError.textContent = "DNI o contraseña incorrectos.";
        }
    })
    .catch(error => console.error('Error:', error));
});
