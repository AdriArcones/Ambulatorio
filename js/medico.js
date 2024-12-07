document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dniMedico = urlParams.get('dni');

    if (!dniMedico) {
        alert("DNI no especificado. Por favor, inicie sesión.");
        return;
    }

    obtenerInformacionMedico(dniMedico);
    obtenerProximasConsultas(dniMedico);
    obtenerConsultasHoy(dniMedico);
});

function obtenerInformacionMedico(dni) {
    fetch(`../php/medico.php?action=info&dni=${dni}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("nombreMedico").textContent = data.nombre;
            document.getElementById("especialidadMedico").textContent = data.especialidad;
        })
        .catch(error => console.error("Error al obtener la información del médico:", error));
}

function obtenerProximasConsultas(dni) {
    fetch(`../php/medico.php?action=proximasConsultas&dni=${dni}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("nProximasConsultas").textContent = data.length;
        })
        .catch(error => console.error("Error al obtener las próximas consultas:", error));
}

function obtenerConsultasHoy(dni) {
    fetch(`../php/medico.php?action=consultasHoy&dni=${dni}`)
        .then(response => response.json())
        .then(data => {
            const consultasHoyContainer = document.getElementById("consultasHoy");
            consultasHoyContainer.innerHTML = "<h3>Consultas de Hoy</h3>"; // Limpiar el contenedor antes de agregar las consultas
            data.forEach(consulta => {
                const div = document.createElement("div");
                div.classList.add("contenido", "consulta");
                div.innerHTML = `
                    <p>ID: <span>${consulta.id}</span></p>
                    <p>Paciente: <span>${consulta.paciente}</span></p>
                    <p>Sintomatología: <span>${consulta.sintomas.substring(0, 100)}</span></p>
                    <button class="btn" data-id="${consulta.id}">Pasar consulta</button>
                `;
                consultasHoyContainer.appendChild(div);
            });

            // Manejar el evento de pasar consulta
            document.querySelectorAll(".btn").forEach(button => {
                button.addEventListener("click", (event) => {
                    const consultaId = event.target.getAttribute("data-id");
                    window.location.href = `consulta.html?id=${consultaId}&medico=${dni}`;
                });
            });
        })
        .catch(error => console.error("Error al obtener las consultas de hoy:", error));
}