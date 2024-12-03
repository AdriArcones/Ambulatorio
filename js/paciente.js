const pacientes = [
    {
        dni: "12345678A",
        nombre: "Juan Pérez",
        info: "Paciente con hipertensión",
        citas: [
            { id: 1, medico: "Dr. García", fecha: "2024-12-05" },
            { id: 2, medico: "Dra. López", fecha: "2024-12-10" }
        ],
        medicacion: [
            { nombre: "Lisinopril", posologia: "10mg cada 24h", hasta: "2024-12-31" }
        ],
        consultas: [
            { id: 1, fecha: "2024-11-20", pdf: "consulta1.pdf" },
            { id: 2, fecha: "2024-11-25", pdf: "consulta2.pdf" }
        ]
    },
    {
        dni: "12345678B",
        nombre: "Ana Gómez",
        info: "Paciente con diabetes tipo 2",
        citas: [
            { id: 1, medico: "Dr. Sánchez", fecha: "2024-12-07" },
            { id: 2, medico: "Dra. Martínez", fecha: "2024-12-14" }
        ],
        medicacion: [
            { nombre: "Metformina", posologia: "850mg cada 12h", hasta: "2025-01-31" }
        ],
        consultas: [
            { id: 1, fecha: "2024-11-22", pdf: "consulta3.pdf" },
            { id: 2, fecha: "2024-11-28", pdf: "consulta4.pdf" }
        ]
    }
];

document.addEventListener("DOMContentLoaded", () => {
    // Obtener el DNI de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const dniPaciente = urlParams.get('dni');

    if (!dniPaciente) {
        alert("DNI no especificado. Por favor, inicie sesión.");
        return;
    }

    // Buscar al paciente en la lista
    const paciente = pacientes.find(p => p.dni === dniPaciente);

    if (!paciente) {
        alert("Paciente no encontrado");
        return;
    }

    // Mostrar información del paciente
    document.getElementById("nombrePaciente").textContent = paciente.nombre;
    document.getElementById("infoPaciente").textContent = paciente.info;

    // Mostrar próximas citas
    const listaCitas = document.getElementById("listaCitas");
    function actualizarListaCitas() {
        listaCitas.innerHTML = ""; // Limpiar la lista antes de actualizar
        paciente.citas.forEach(cita => {
            const li = document.createElement("li");
            li.textContent = `ID: ${cita.id}, Médico: ${cita.medico}, Fecha: ${cita.fecha}`;
            listaCitas.appendChild(li);
        });
    }
    actualizarListaCitas();

    // Mostrar medicación actual
    const listaMedicacion = document.getElementById("listaMedicacion");
    paciente.medicacion.forEach(med => {
        const li = document.createElement("li");
        li.textContent = `${med.nombre}, ${med.posologia}, hasta ${med.hasta}`;
        listaMedicacion.appendChild(li);
    });

    // Mostrar consultas pasadas
    const listaConsultas = document.getElementById("listaConsultas");
    paciente.consultas.forEach(consulta => {
        const li = document.createElement("li");
        li.textContent = `ID: ${consulta.id}, Fecha: ${consulta.fecha}`;
        li.addEventListener("click", () => {
            mostrarConsultaSeleccionada(consulta);
        });
        listaConsultas.appendChild(li);
    });

    // Llenar el select con los médicos disponibles
    const selectMedico = document.getElementById("medico");
    const medicosDisponibles = ["Dr. García", "Dra. López", "Dr. Sánchez", "Dra. Martínez"]; // Lista de médicos disponibles
    medicosDisponibles.forEach(medico => {
        const option = document.createElement("option");
        option.value = medico;
        option.textContent = medico;
        selectMedico.appendChild(option);
    });

    // Validar fecha al cambiar el valor del input de fecha
    const fechaInput = document.getElementById("fecha");
    const mensajeErrorFecha = document.createElement("span");
    mensajeErrorFecha.classList.add("error");
    fechaInput.parentNode.insertBefore(mensajeErrorFecha, fechaInput.nextSibling);

    fechaInput.addEventListener("change", () => {
        const fechaSeleccionada = new Date(fechaInput.value);
        const hoy = new Date();
        const fechaLimite = new Date(hoy);
        fechaLimite.setMonth(hoy.getMonth() + 1);

        if (fechaSeleccionada < hoy) {
            mensajeErrorFecha.innerHTML = "Fecha no válida<br><br>";
        } else if (fechaSeleccionada > fechaLimite) {
            mensajeErrorFecha.innerHTML = "Tan malo no estarás. Pide una fecha como máximo 30 días en el futuro<br><br>";
        } else if (fechaSeleccionada.getDay() === 0 || fechaSeleccionada.getDay() === 6) {
            mensajeErrorFecha.innerHTML = "Por favor, elija un día laborable<br><br>";
        } else {
            mensajeErrorFecha.innerHTML = "";
        }
    });

    // Validar y pedir cita
    document.getElementById("formCita").addEventListener("submit", (event) => {
        event.preventDefault();

        const medico = document.getElementById("medico").value;
        const fecha = document.getElementById("fecha").value;
        const sintomas = document.getElementById("sintomas").value;

        // Validaciones
        let hayErrores = false;
        if (!medico || !fecha || !sintomas.trim()) {
            alert("Por favor, complete todos los campos.");
            hayErrores = true;
        }

        const fechaSeleccionada = new Date(fecha);
        const hoy = new Date();
        const fechaLimite = new Date(hoy);
        fechaLimite.setMonth(hoy.getMonth() + 1);

        if (fechaSeleccionada < hoy || fechaSeleccionada.getDay() === 0 || fechaSeleccionada.getDay() === 6 || fechaSeleccionada > fechaLimite) {
            alert("Por favor, elija una fecha válida.");
            hayErrores = true;
        }

        if (hayErrores) return;

        // Añadir la cita al array de citas del paciente
        paciente.citas.push({ id: paciente.citas.length + 1, medico, fecha });

        // Actualizar la lista de próximas citas
        actualizarListaCitas();

        alert("Cita pedida con éxito");
    });

    // Mostrar información de la consulta seleccionada
    function mostrarConsultaSeleccionada(consulta) {
        const consultaSeleccionada = document.getElementById("consultaSeleccionada");
        const infoConsultaSeleccionada = document.getElementById("infoConsultaSeleccionada");

        consultaSeleccionada.style.display = "block";
        infoConsultaSeleccionada.innerHTML = `
            <p>ID de la consulta: ${consulta.id}</p>
            <p>Fecha: ${consulta.fecha}</p>
            ${consulta.pdf ? `<p><a href="../data/${consulta.pdf}" target="_blank">Ver PDF</a></p>` : ''}
        `;
    }
});
