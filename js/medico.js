const medicos = [
    {
        dni: "12345678Y",
        nombre: "Dr. García",
        especialidad: "Cardiología",
        consultas: [
            { id: 1, paciente: "Juan Pérez", fecha: "2024-12-02", sintomas: "Dolor en el pecho" },
            { id: 2, paciente: "Ana López", fecha: "2024-12-02", sintomas: "Mareos y náuseas" },
            { id: 3, paciente: "Carlos Martínez", fecha: "2024-12-05", sintomas: "Fiebre alta" },
        ]
    },
    {
        dni: "12345678Z",
        nombre: "Dra. López",
        especialidad: "Medicina General",
        consultas: [
            { id: 1, paciente: "Juan Pérez", fecha: "2024-12-02", sintomas: "Dolor de cabeza" },
        ]
    },
];

document.addEventListener("DOMContentLoaded", () => {
    // Obtener el DNI del médico desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const dniMedico = urlParams.get('dni');

    if (!dniMedico) {
        alert("DNI no especificado. Por favor, inicie sesión.");
        return;
    }

    // Buscar al médico en la lista
    const medico = medicos.find(m => m.dni === dniMedico);

    if (!medico) {
        alert("Médico no encontrado");
        return;
    }

    // Mostrar información del médico
    document.getElementById("nombreMedico").textContent = medico.nombre;
    document.getElementById("especialidadMedico").textContent = medico.especialidad;

    // Mostrar número de consultas en los próximos 7 días
    const consultasSemana = medico.consultas.filter(consulta => {
        const fechaConsulta = new Date(consulta.fecha);
        const hoy = new Date();
        const sieteDiasDespues = new Date(hoy);
        sieteDiasDespues.setDate(hoy.getDate() + 7);

        // Aseguramos que el rango incluya las consultas de hoy
        return fechaConsulta >= hoy.setHours(0, 0, 0, 0) &&
               fechaConsulta <= sieteDiasDespues.setHours(23, 59, 59, 999);
    });
    document.getElementById("nProximasConsultas").textContent = consultasSemana.length;

    // Mostrar consultas de hoy
    const consultasHoy = medico.consultas.filter(consulta => {
        const fechaConsulta = new Date(consulta.fecha);
        const hoy = new Date();
        return fechaConsulta.toDateString() === hoy.toDateString();
    });

    const consultasHoyContainer = document.getElementById("consultasHoy");
    consultasHoyContainer.innerHTML = "<h3>Consultas de Hoy</h3>"; // Limpiar el contenedor antes de agregar las consultas
    consultasHoy.forEach(consulta => {
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
            window.location.href = `consulta.html?id=${consultaId}&medico=${dniMedico}`;
        });
    });
});
