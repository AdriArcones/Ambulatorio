const botonSwitch = document.getElementById("botonSwitch");
const valueDisplay = document.getElementById("valorSwitch");
const form = document.getElementById("formulario-login");
const errorDni = document.getElementById("error-dni");
const errorContra = document.getElementById("error-contra");
const loginError = document.getElementById("login-error");

// Cambiar el valor del switch
botonSwitch.addEventListener("change", () => {
    valueDisplay.textContent = botonSwitch.checked ? "Médico" : "Paciente";
});

// Validar DNI cuando el campo pierde el foco
document.getElementById("dni").addEventListener("blur", () => {
    const dni = document.getElementById("dni").value;
    const dniRegex = /^[0-9]{8}[A-Za-z]$/;
    errorDni.textContent = dniRegex.test(dni) ? "" : "DNI no válido";
});

// Llamar a tablas.php para inicializar la base de datos
window.addEventListener("load", () => {
    fetch("php/tablas.php")
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo conectar a tablas.php");
            }
            return response.text();
        })
        .then((data) => {
            console.log("Resultado de tablas.php:", data);
        })
        .catch((error) => {
            console.error("Error al ejecutar tablas.php:", error);
        });
});


// Inicio sesión
form.addEventListener("submit", (event) => {
    event.preventDefault(); // Evitar el envío del formulario

    const dni = document.getElementById("dni").value;
    const contra = document.getElementById("contra").value;
    const rol = botonSwitch.checked ? "medico" : "paciente";

    fetch("php/login.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ dni, contra, rol })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = data.redirect;
        } else {
            loginError.textContent = data.message;
        }
    })
    .catch(error => {
        console.error("Error:", error);
        loginError.textContent = "Error al iniciar sesión.";
    });
});

