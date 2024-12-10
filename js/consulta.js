let consultaId;
let dniMedico;

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    consultaId = urlParams.get('id');
    dniMedico = urlParams.get('medico');

    if (!consultaId || !dniMedico) {
        alert("ID de consulta o DNI de médico no especificado. Por favor, inicie sesión.");
        return;
    }

    obtenerDatosConsulta(consultaId, dniMedico);
    obtenerMedicamentosDisponibles();
    obtenerEspecialistasDisponibles(dniMedico);
});

function obtenerDatosConsulta(consultaId, dniMedico) {
    fetch(`../php/consulta.php?action=obtenerConsulta&id=${consultaId}&medico=${dniMedico}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarDatosConsulta(data.consulta);
            } else {
                alert("Error al obtener los datos de la consulta: " + data.message);
            }
        })
        .catch(error => console.error("Error al obtener los datos de la consulta:", error));
}

function mostrarDatosConsulta(consulta) {
    document.getElementById("nombreMedico").textContent = consulta.medico;
    document.getElementById("nombrePaciente").textContent = consulta.paciente;
    document.getElementById("fechaConsulta").textContent = consulta.fecha;
    document.getElementById("sintomas").value = consulta.sintomas;
    document.getElementById("diagnostico").value = consulta.diagnostico;

    // Mostrar medicación
    const listaMedicacion = document.getElementById("listaMedicacion");
    listaMedicacion.innerHTML = "";
    consulta.medicacion.forEach(med => {
        const li = document.createElement("li");
        li.textContent = `${med.nombre}, ${med.cantidad}, ${med.frecuencia}, ${med.duracion}`;
        listaMedicacion.appendChild(li);
    });

    // Subir PDF
    if (consulta.pdf) {
        const pdfLink = document.createElement("a");
        pdfLink.href = `../data/${consulta.pdf}`;
        pdfLink.textContent = "Descargar PDF";
        pdfLink.target = "_blank";
        document.getElementById("subir").appendChild(pdfLink);
    }
}

function obtenerMedicamentosDisponibles() {
    fetch(`../php/consulta.php?action=obtenerMedicamentos`)
        .then(response => response.json())
        .then(data => {
            const selectMedicamento = document.getElementById("medicamento");
            data.forEach(med => {
                const option = document.createElement("option");
                option.value = med.id;
                option.textContent = med.nombre;
                selectMedicamento.appendChild(option);
            });
        })
        .catch(error => console.error("Error al obtener los medicamentos disponibles:", error));
}

function obtenerEspecialistasDisponibles(dniMedico) {
    fetch(`../php/consulta.php?action=obtenerEspecialistas&medico=${dniMedico}`)
        .then(response => response.json())
        .then(data => {
            const selectEspecialista = document.getElementById("selectEspecialista");
            data.forEach(esp => {
                const option = document.createElement("option");
                option.value = esp.id;
                option.textContent = `${esp.nombre} (${esp.especialidad})`;
                selectEspecialista.appendChild(option);
            });
        })
        .catch(error => console.error("Error al obtener los especialistas disponibles:", error));
}

// Validaciones y funcionalidades adicionales
document.getElementById("btnRegistrar").addEventListener("click", () => {
    const sintomas = document.getElementById("sintomas").value.trim();
    const diagnosticoElement = document.getElementById("diagnostico");
    const fechaEspecialistaElement = document.getElementById("fechaEspecialista");

    const diagnostico = diagnosticoElement ? diagnosticoElement.value.trim() : "";
    const fechaEspecialista = fechaEspecialistaElement ? fechaEspecialistaElement.value : "";

    const mensajeErrorDiagnostico = document.getElementById("mensajeErrorDiagnostico");
    const mensajeErrorFechaEspecialista = document.getElementById("mensajeErrorFechaEspecialista");

    let valid = true;

    // Validación de diagnóstico
    if (!diagnostico) {
        mensajeErrorDiagnostico.textContent = "El diagnóstico es obligatorio.";
        valid = false;
    } else {
        mensajeErrorDiagnostico.textContent = "";
    }

    // Validación de fecha de especialista
    if (!fechaEspecialista) {
        mensajeErrorFechaEspecialista.textContent = "La fecha de cita es obligatoria.";
        valid = false;
    } else {
        const fechaSeleccionada = new Date(fechaEspecialista);
        const hoy = new Date();
        const tresMesesDespues = new Date(hoy);
        tresMesesDespues.setMonth(hoy.getMonth() + 3);

        if (fechaSeleccionada < hoy) {
            mensajeErrorFechaEspecialista.textContent = "Fecha no válida.";
            valid = false;
        } else if (fechaSeleccionada.getDay() === 0 || fechaSeleccionada.getDay() === 6) {
            mensajeErrorFechaEspecialista.textContent = "Elige un día laboral.";
            valid = false;
        } else if (fechaSeleccionada > tresMesesDespues) {
            mensajeErrorFechaEspecialista.textContent = "Elige una fecha dentro de los próximos 3 meses.";
            valid = false;
        } else {
            mensajeErrorFechaEspecialista.textContent = "";
        }
    }

    if (!valid) {
        return;
    }

    const medicacion = [];
    document.querySelectorAll("#listaMedicacion li").forEach(li => {
        const [nombre, cantidad, frecuencia, duracion] = li.textContent.split(", ");
        medicacion.push({ nombre, cantidad, frecuencia, duracion });
    });

    const pdf = document.getElementById("subirPdf").files[0];
    const especialista = document.getElementById("selectEspecialista").value;

    const formData = new FormData();
    formData.append("sintomas", sintomas);
    formData.append("diagnostico", diagnostico);
    formData.append("medicacion", JSON.stringify(medicacion));
    if (pdf) {
        formData.append("pdf", pdf);
    }
    formData.append("especialista", especialista);
    formData.append("fechaEspecialista", fechaEspecialista);

    fetch(`../php/consulta.php?action=registrarConsulta&id=${consultaId}&medico=${dniMedico}`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Consulta registrada con éxito.");
            window.location.href = `medico.html?dni=${dniMedico}`;
        } else {
            alert("Error al registrar la consulta: " + data.message);
        }
    })
    .catch(error => console.error("Error al registrar la consulta:", error));
});

// Validaciones de medicación
document.getElementById("btnAddMedicacion").addEventListener("click", () => {
    const medicamento = document.getElementById("medicamento").value;
    const cantidad = document.getElementById("cantidad").value.trim();
    const frecuencia = document.getElementById("frecuencia").value.trim();
    const duracion = document.getElementById("duracion").value.trim();
    const cronica = document.getElementById("cronica").checked;

    const mensajeErrorMedicacion = document.getElementById("mensajeErrorMedicacion");

    if (!medicamento || !cantidad || !frecuencia || (!duracion && !cronica)) {
        mensajeErrorMedicacion.textContent = "Por favor, complete todos los campos de medicación.";
        return;
    }

    const nuevaMedicacion = {
        medicamento,
        cantidad,
        frecuencia,
        duracion: cronica ? "365 días" : duracion
    };

    const listaMedicacion = document.getElementById("listaMedicacion");
    const li = document.createElement("li");
    li.textContent = `${nuevaMedicacion.medicamento}, ${nuevaMedicacion.cantidad}, ${nuevaMedicacion.frecuencia}, ${nuevaMedicacion.duracion}`;
    listaMedicacion.appendChild(li);

    mensajeErrorMedicacion.textContent = "";
});

// Validaciones de fecha para especialista
document.getElementById("fechaEspecialista").addEventListener("blur", () => {
    const fechaEspecialista = document.getElementById("fechaEspecialista").value;
    const fechaSeleccionada = new Date(fechaEspecialista);
    const hoy = new Date();
    const tresMesesDespues = new Date(hoy);
    tresMesesDespues.setMonth(hoy.getMonth() + 3);

    const mensajeErrorFechaEspecialista = document.getElementById("mensajeErrorFechaEspecialista");

    if (fechaSeleccionada < hoy) {
        mensajeErrorFechaEspecialista.textContent = "Fecha no válida.";
    } else if (fechaSeleccionada.getDay() === 0 || fechaSeleccionada.getDay() === 6) {
        mensajeErrorFechaEspecialista.textContent = "Elige un día laboral.";
    } else if (fechaSeleccionada > tresMesesDespues) {
        mensajeErrorFechaEspecialista.textContent = "Elige una fecha dentro de los próximos 3 meses.";
    } else {
        mensajeErrorFechaEspecialista.textContent = "";
    }
});

// Mostrar/ocultar campo de duración según el checkbox "crónica"
document.getElementById("cronica").addEventListener("change", (event) => {
    const duracionInput = document.getElementById("duracion");
    const duracionLabel = document.querySelector("label[for='duracion']");
    if (event.target.checked) {
        duracionInput.style.display = "none";
        duracionLabel.style.display = "none";
    } else {
        duracionInput.style.display = "block";
        duracionLabel.style.display = "block";
    }
});