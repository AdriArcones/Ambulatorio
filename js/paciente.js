document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dniPaciente = urlParams.get('dni');

    if (!dniPaciente) {
        alert("DNI no especificado. Por favor, inicie sesión.");
        return;
    }

    obtenerInformacionPaciente(dniPaciente);
    obtenerProximasCitas(dniPaciente);
    obtenerMedicacionActual(dniPaciente);
    obtenerConsultasPasadas(dniPaciente);
    configurarFormularioCita(dniPaciente);
});

function obtenerInformacionPaciente(dni) {
    fetch(`../php/paciente.php?action=info&dni=${dni}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("nombrePaciente").textContent = data.nombre;
            document.getElementById("infoPaciente").textContent = data.informacion;
        })
        .catch(error => console.error("Error al obtener la información del paciente:", error));
}

function obtenerProximasCitas(dni) {
    fetch(`../php/paciente.php?action=proximasCitas&dni=${dni}`)
        .then(response => response.json())
        .then(data => {
            const listaCitas = document.getElementById("listaCitas");
            listaCitas.innerHTML = "";
            data.forEach(cita => {
                const li = document.createElement("li");
                li.textContent = `ID: ${cita.id}, Médico: ${cita.medico}, Fecha: ${cita.fecha}`;
                listaCitas.appendChild(li);
            });
        })
        .catch(error => console.error("Error al obtener las próximas citas:", error));
}

function obtenerMedicacionActual(dni) {
    fetch(`../php/paciente.php?action=medicacionActual&dni=${dni}`)
        .then(response => response.json())
        .then(data => {
            const listaMedicacion = document.getElementById("listaMedicacion");
            listaMedicacion.innerHTML = "";
            data.forEach(medicacion => {
                const li = document.createElement("li");
                li.textContent = `${medicacion.nombre}, Posología: ${medicacion.posologia}, Hasta: ${medicacion.hasta}`;
                listaMedicacion.appendChild(li);
            });
        })
        .catch(error => console.error("Error al obtener la medicación actual:", error));
}

function obtenerConsultasPasadas(dni) {
    fetch(`../php/paciente.php?action=consultasPasadas&dni=${dni}`)
        .then(response => response.json())
        .then(data => {
            const listaConsultas = document.getElementById("listaConsultas");
            listaConsultas.innerHTML = "";
            data.forEach(consulta => {
                const li = document.createElement("li");
                li.textContent = `ID: ${consulta.id}, Fecha: ${consulta.fecha}`;
                li.addEventListener("click", () => mostrarDetalleConsulta(consulta.id)); 
                listaConsultas.appendChild(li);
            });
        })
        .catch(error => console.error("Error al obtener las consultas pasadas:", error));
}

function mostrarDetalleConsulta(idConsulta) {
    fetch(`../php/paciente.php?action=detalleConsulta&id=${idConsulta}`)
        .then(response => response.json())
        .then(data => {
            console.log("Datos de la consulta:", data); 
            const consultaSeleccionada = document.getElementById("consultaSeleccionada");
            const infoConsultaSeleccionada = document.getElementById("infoConsultaSeleccionada");

            consultaSeleccionada.style.display = "block";
            infoConsultaSeleccionada.innerHTML = `
                <p>ID de la consulta: ${data.id}</p>
                <p>Fecha: ${data.fecha}</p>
                <p>Síntomas: ${data.sintomas}</p>
                <p>Diagnóstico: ${data.diagnostico}</p>
                <p>Medicación: ${data.medicacion}</p>
                ${data.pdf ? `<p><a href="../data/${data.pdf}" target="_blank">Descargar PDF</a></p>` : ''}
            `;

        })
        .catch(error => console.error("Error al obtener los detalles de la consulta:", error));
}

function configurarFormularioCita(dni) {
    const formCita = document.getElementById("formCita");
    const fechaInput = document.getElementById("fecha");
    const sintomasInput = document.getElementById("sintomas");
    const errorFecha = document.getElementById("errorFecha");
    const errorSintomas = document.getElementById("errorSintomas");

    fetch(`../php/paciente.php?action=medicosDisponibles&dni=${dni}`)
        .then(response => response.json())
        .then(data => {
            const selectMedico = document.getElementById("medico");
            selectMedico.innerHTML = "";
            data.forEach(medico => {
                const option = document.createElement("option");
                option.value = medico.id;
                option.textContent = `${medico.nombre} (${medico.especialidad})`;
                selectMedico.appendChild(option);
            });
        })
        .catch(error => console.error("Error al obtener los médicos disponibles:", error));

    fechaInput.addEventListener("change", () => {
        validarFecha(fechaInput, errorFecha);
    });

    formCita.addEventListener("submit", (event) => {
        event.preventDefault();
        const validFecha = validarFecha(fechaInput, errorFecha);
        const validSintomas = validarSintomas(sintomasInput, errorSintomas);

        if (validFecha && validSintomas) {
            const medico = document.getElementById("medico").value;
            const fecha = fechaInput.value;
            const sintomas = sintomasInput.value;

            fetch(`../php/paciente.php?action=pedirCita&dni=${dni}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ medico, fecha, sintomas })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Cita pedida correctamente");
                    obtenerProximasCitas(dni);
                } else {
                    alert("Error al pedir la cita: " + data.message);
                }
            })
            .catch(error => console.error("Error al pedir la cita:", error));
        }
    });
}

function validarFecha(fechaInput, errorFecha) {
    if (!fechaInput.value) {
        errorFecha.textContent = "La fecha es obligatoria";
        return false;
    }

    const fechaSeleccionada = new Date(fechaInput.value);
    const hoy = new Date();
    const unMesDespues = new Date(hoy);
    unMesDespues.setMonth(hoy.getMonth() + 1);

    if (fechaSeleccionada < hoy) {
        errorFecha.textContent = "Fecha no válida";
        return false;
    } else if (fechaSeleccionada.getDay() === 0 || fechaSeleccionada.getDay() === 6) {
        errorFecha.textContent = "Por favor, elija un día laborable";
        return false;
    } else if (fechaSeleccionada > unMesDespues) {
        errorFecha.textContent = "Tan malo no estarás. Pide una fecha como máximo 30 días en el futuro";
        return false;
    } else {
        errorFecha.textContent = "";
        return true;
    }
}

function validarSintomas(sintomasInput, errorSintomas) {
    if (!sintomasInput.value.trim()) {
        errorSintomas.textContent = "La sintomatología es obligatoria";
        return false;
    } else {
        errorSintomas.textContent = "";
        return true;
    }
}