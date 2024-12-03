const consultas = [
    {
        id: 1,
        medico: "Dr. García",
        paciente: "Juan Pérez",
        fecha: "2024-12-01",
        sintomas: "Dolor en el pecho",
        diagnostico: "",
        medicacion: [],
        pdf: "",
        especialista: ""
    },

    {
        id: 2,
        medico: "Dr. García",
        paciente: "Ana López",
        fecha: "2024-12-01",
        sintomas: "Mareos y náuseas",
        diagnostico: "",
        medicacion: [],
        pdf: "",
        especialista: ""
    },
];

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const consultaId = parseInt(urlParams.get('id'), 10); // Obtener ID desde la URL
    const consulta = consultas.find(c => c.id === consultaId);

    if (!consulta) {
        alert("Consulta no encontrada");
        return;
    }

    // Mostrar información de la consulta
    document.getElementById("nombreMedico").textContent = consulta.medico;
    document.getElementById("nombrePaciente").textContent = consulta.paciente;
    document.getElementById("fechaConsulta").textContent = consulta.fecha;

    // Mostrar y editar sintomatología
    const sintomasInput = document.getElementById("sintomas");
    sintomasInput.value = consulta.sintomas;

    // Mostrar y editar diagnóstico
    const diagnosticoInput = document.getElementById("diagnostico");
    diagnosticoInput.value = consulta.diagnostico;

    // Añadir medicación
    const formMedicacion = document.getElementById("formMedicacion");
    const listaMedicacion = document.getElementById("listaMedicacion");
    const medicamentosDisponibles = ["Paracetamol", "Ibuprofeno"]; // Lista de medicamentos disponibles
    const selectMedicamento = document.getElementById("medicamento");

    medicamentosDisponibles.forEach(med => {
        const option = document.createElement("option");
        option.value = med;
        option.textContent = med;
        selectMedicamento.appendChild(option);
    });

    const cantidadInput = document.getElementById("cantidad");
    const frecuenciaInput = document.getElementById("frecuencia");
    const duracionInput = document.getElementById("duracion");
    const cronicaCheckbox = document.getElementById("cronica");
    const mensajeErrorMedicacion = document.createElement("span");
    mensajeErrorMedicacion.classList.add("error");
    formMedicacion.appendChild(mensajeErrorMedicacion);

    document.getElementById("btnAddMedicacion").addEventListener("click", () => {
        const medicamento = selectMedicamento.value;
        const cantidad = cantidadInput.value;
        const frecuencia = frecuenciaInput.value;
        const duracion = duracionInput.value;
        const cronica = cronicaCheckbox.checked;

        // Validar los campos de medicación
        if (!medicamento || !cantidad || !frecuencia || (!duracion && !cronica)) {
            mensajeErrorMedicacion.innerHTML = "Por favor, complete todos los campos de medicación.<br>";
            return;
        }
        if (cantidad.length > 100 || frecuencia.length > 100 || duracion.length > 100) {
            mensajeErrorMedicacion.innerHTML = "Los campos de medicación no deben exceder los 100 caracteres.<br>";
            return;
        }

        const nuevaMedicacion = {
            medicamento,
            cantidad,
            frecuencia,
            duracion: cronica ? "365 días" : duracion
        };

        consulta.medicacion.push(nuevaMedicacion);
        actualizarListaMedicacion();
        mensajeErrorMedicacion.innerHTML = "";
    });

    function actualizarListaMedicacion() {
        listaMedicacion.innerHTML = "";
        consulta.medicacion.forEach(med => {
            const li = document.createElement("li");
            li.textContent = `${med.medicamento}, ${med.cantidad}, ${med.frecuencia}, ${med.duracion}`;
            listaMedicacion.appendChild(li);
        });
    }
    actualizarListaMedicacion();

    // Subir PDF
    document.getElementById("subirPdf").addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            consulta.pdf = `html/pdf/${file.name}`;
        }
    });

    // Derivar a especialista
    const formEspecialista = document.getElementById("formEspecialista");
    const selectEspecialista = document.getElementById("selectEspecialista");
    const especialistasDisponibles = ["Dr. López", "Dra. Martínez"]; // Lista de especialistas disponibles

    especialistasDisponibles.forEach(esp => {
        const option = document.createElement("option");
        option.value = esp;
        option.textContent = esp;
        selectEspecialista.appendChild(option);
    });

    const fechaEspecialistaInput = document.getElementById("fechaEspecialista");
    const mensajeErrorFechaEspecialista = document.createElement("span");
    mensajeErrorFechaEspecialista.classList.add("error");
    fechaEspecialistaInput.parentNode.insertBefore(mensajeErrorFechaEspecialista, fechaEspecialistaInput.nextSibling);

    fechaEspecialistaInput.addEventListener("blur", () => {
        const fechaEspecialista = fechaEspecialistaInput.value;
        const fechaSeleccionada = new Date(fechaEspecialista);
        const hoy = new Date();
        const tresMesesDespues = new Date(hoy);
        tresMesesDespues.setMonth(hoy.getMonth() + 3);

        if (fechaSeleccionada < hoy || fechaSeleccionada.getDay() === 0 || fechaSeleccionada.getDay() === 6 || fechaSeleccionada > tresMesesDespues) {
            mensajeErrorFechaEspecialista.innerHTML = "Por favor, elija una fecha válida (dentro de los próximos 3 meses y en días laborables).<br>";
        } else {
            mensajeErrorFechaEspecialista.innerHTML = "";
        }
    });

    document.getElementById("btnAddCita").addEventListener("click", () => {
        const especialista = selectEspecialista.value;
        const fechaEspecialista = fechaEspecialistaInput.value;

        if (!especialista || !fechaEspecialista || mensajeErrorFechaEspecialista.innerHTML) {
            mensajeErrorFechaEspecialista.innerHTML = "Por favor, complete todos los campos para derivar a un especialista.<br>";
            return;
        }

        consulta.especialista = {
            especialista,
            fecha: fechaEspecialista
        };

        mensajeErrorFechaEspecialista.innerHTML = "";
        alert("Cita con especialista añadida con éxito.");
    });

    // Validar campos obligatorios en tiempo real
    const mensajeErrorSintomas = document.createElement("span");
    mensajeErrorSintomas.classList.add("error");
    sintomasInput.parentNode.appendChild(mensajeErrorSintomas);

    const mensajeErrorDiagnostico = document.createElement("span");
    mensajeErrorDiagnostico.classList.add("error");
    diagnosticoInput.parentNode.appendChild(mensajeErrorDiagnostico);

    sintomasInput.addEventListener("blur", () => {
        if (!sintomasInput.value.trim()) {
            mensajeErrorSintomas.innerHTML = "Por favor, complete el campo de sintomatología.<br>";
        } else {
            mensajeErrorSintomas.innerHTML = "";
        }
    });

    diagnosticoInput.addEventListener("blur", () => {
        if (!diagnosticoInput.value.trim()) {
            mensajeErrorDiagnostico.innerHTML = "Por favor, complete el campo de diagnóstico.<br>";
        } else {
            mensajeErrorDiagnostico.innerHTML = "";
        }
    });

    // Registrar consulta
    document.getElementById("btnRegistrar").addEventListener("click", () => {
        consulta.sintomas = sintomasInput.value;
        consulta.diagnostico = diagnosticoInput.value;

        alert("Consulta registrada con éxito.");
    });

    // Mostrar/ocultar campo de duración según el checkbox "crónica"
    cronicaCheckbox.addEventListener("change", (event) => {
        const duracionLabel = document.querySelector("label[for='duracion']");
        if (event.target.checked) {
            duracionInput.style.display = "none";
            duracionLabel.style.display = "none";
        } else {
            duracionInput.style.display = "block";
            duracionLabel.style.display = "block";
        }
    });
});