<?php
include_once 'conecta.php';

$action = $_GET['action'];

switch ($action) {
    case 'obtenerConsulta':
        $consultaId = $_GET['id'];
        $dniMedico = $_GET['medico'];
        obtenerConsulta($consultaId, $dniMedico);
        break;
    case 'registrarConsulta':
        $consultaId = $_GET['id'];
        $dniMedico = $_GET['medico'];
        registrarConsulta($consultaId, $dniMedico);
        break;
    case 'obtenerMedicamentos':
        obtenerMedicamentos();
        break;
    case 'obtenerEspecialistas':
        $dniMedico = $_GET['medico'];
        obtenerEspecialistas($dniMedico);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

function obtenerConsulta($consultaId, $dniMedico) {
    global $conexion;
    $sql = "SELECT cita.id, cita.fecha, cita.sintomas, cita.diagnostico, cita.pdf, 
                   medico.nombre AS medico, paciente.nombre AS paciente
            FROM cita
            JOIN medico ON cita.id_medico = medico.id
            JOIN paciente ON cita.id_paciente = paciente.id
            WHERE cita.id = ? AND medico.dni = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("is", $consultaId, $dniMedico);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $consulta = $result->fetch_assoc();

        // Obtener medicación
        $sql_medicacion = "SELECT medicamento.nombre, cita_medicamento.cantidad, cita_medicamento.frecuencia, cita_medicamento.duracion
                           FROM cita_medicamento
                           JOIN medicamento ON cita_medicamento.id_medicamento = medicamento.id
                           WHERE cita_medicamento.id_cita = ?";
        $stmt_medicacion = $conexion->prepare($sql_medicacion);
        $stmt_medicacion->bind_param("i", $consultaId);
        $stmt_medicacion->execute();
        $result_medicacion = $stmt_medicacion->get_result();

        $medicacion = [];
        while ($row = $result_medicacion->fetch_assoc()) {
            $medicacion[] = $row;
        }

        $consulta['medicacion'] = $medicacion;

        echo json_encode(['success' => true, 'consulta' => $consulta]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Consulta no encontrada']);
    }

    $stmt->close();
    $conexion->close();
}

function registrarConsulta($consultaId, $dniMedico) {
    global $conexion;

    $sintomas = $_POST['sintomas'];
    $diagnostico = $_POST['diagnostico'];
    $medicacion = json_decode($_POST['medicacion'], true);
    $especialista = $_POST['especialista'];
    $fechaEspecialista = $_POST['fechaEspecialista'];

    // Actualizar consulta
    $sql = "UPDATE cita SET sintomas = ?, diagnostico = ? WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssi", $sintomas, $diagnostico, $consultaId);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar la consulta']);
        return;
    }

    // Insertar medicación
    $sql_delete_medicacion = "DELETE FROM cita_medicamento WHERE id_cita = ?";
    $stmt_delete = $conexion->prepare($sql_delete_medicacion);
    $stmt_delete->bind_param("i", $consultaId);
    $stmt_delete->execute();

    $sql_insert_medicacion = "INSERT INTO cita_medicamento (id_cita, id_medicamento, cantidad, frecuencia, duracion) VALUES (?, ?, ?, ?, ?)";
    $stmt_insert = $conexion->prepare($sql_insert_medicacion);

    foreach ($medicacion as $med) {
        $stmt_insert->bind_param("iisss", $consultaId, $med['medicamento'], $med['cantidad'], $med['frecuencia'], $med['duracion']);
        if (!$stmt_insert->execute()) {
            echo json_encode(['success' => false, 'message' => 'Error al insertar la medicación']);
            return;
        }
    }

    // Subir PDF
    if (isset($_FILES['pdf']) && $_FILES['pdf']['error'] == UPLOAD_ERR_OK) {
        $pdf = $_FILES['pdf'];
        $pdfPath = "../data/" . basename($pdf['name']);
        if (!move_uploaded_file($pdf['tmp_name'], $pdfPath)) {
            echo json_encode(['success' => false, 'message' => 'Error al subir el archivo PDF']);
            return;
        }

        $sql_update_pdf = "UPDATE cita SET pdf = ? WHERE id = ?";
        $stmt_update_pdf = $conexion->prepare($sql_update_pdf);
        $stmt_update_pdf->bind_param("si", $pdfPath, $consultaId);
        if (!$stmt_update_pdf->execute()) {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar la ruta del PDF']);
            return;
        }
    }

    // Derivar a especialista
    if ($especialista && $fechaEspecialista) {
        $sql_insert_especialista = "INSERT INTO cita (id_paciente, id_medico, fecha, sintomas) VALUES ((SELECT id_paciente FROM cita WHERE id = ?), ?, ?, 'Derivado a especialista')";
        $stmt_especialista = $conexion->prepare($sql_insert_especialista);
        $stmt_especialista->bind_param("iis", $consultaId, $especialista, $fechaEspecialista);
        if (!$stmt_especialista->execute()) {
            echo json_encode(['success' => false, 'message' => 'Error al derivar a especialista']);
            return;
        }
    }

    echo json_encode(['success' => true, 'message' => 'Consulta registrada con éxito']);
    $stmt->close();
    $conexion->close();
}

function obtenerMedicamentos() {
    global $conexion;
    $sql = "SELECT id, nombre FROM medicamento";
    $result = $conexion->query($sql);
    $medicamentos = [];
    while ($row = $result->fetch_assoc()) {
        $medicamentos[] = $row;
    }
    echo json_encode($medicamentos);
}

function obtenerEspecialistas($dniMedico) {
    global $conexion;
    $sql = "SELECT medico.id, medico.nombre, medico.especialidad 
            FROM medico 
            JOIN paciente_medico ON medico.id = paciente_medico.id_medico 
            JOIN paciente ON paciente_medico.id_paciente = paciente.id 
            WHERE paciente.id IN (SELECT id_paciente FROM cita WHERE id_medico = (SELECT id FROM medico WHERE dni = ?))";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $dniMedico);
    $stmt->execute();
    $result = $stmt->get_result();
    $especialistas = [];
    while ($row = $result->fetch_assoc()) {
        $especialistas[] = $row;
    }
    echo json_encode($especialistas);
    $stmt->close();
    $conexion->close();
}
?>