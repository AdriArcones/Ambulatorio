<?php
include_once 'conecta.php';

$action = $_GET['action'];

switch ($action) {
    case 'info':
        obtenerInformacionPaciente();
        break;
    case 'proximasCitas':
        obtenerProximasCitas();
        break;
    case 'medicacionActual':
        obtenerMedicacionActual();
        break;
    case 'consultasPasadas':
        obtenerConsultasPasadas();
        break;
    case 'detalleConsulta':
        $idConsulta = $_GET['id'];
        obtenerDetalleConsulta($idConsulta);
        break;
    case 'pedirCita':
        $data = json_decode(file_get_contents("php://input"), true);
        pedirCita($data);
        break;
    case 'medicosDisponibles':
        obtenerMedicosDisponibles();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

function obtenerInformacionPaciente() {
    global $conexion;
    $dni = '12345678A'; // Aquí deberías obtener el DNI del paciente autenticado
    $sql = "SELECT nombre, informacion FROM paciente WHERE dni = '$dni'"; 
    $result = $conexion->query($sql);
    $data = $result->fetch_assoc();
    echo json_encode($data);
}

function obtenerProximasCitas() {
    global $conexion;
    $dni = '12345678A'; // Aquí deberías obtener el DNI del paciente autenticado
    $sql = "SELECT cita.id, medico.nombre AS medico, cita.fecha 
            FROM cita 
            JOIN medico ON cita.id_medico = medico.id 
            JOIN paciente ON cita.id_paciente = paciente.id 
            WHERE paciente.dni = '$dni' AND cita.fecha >= CURDATE()";
    $result = $conexion->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function obtenerMedicacionActual() {
    global $conexion;
    $dni = '12345678A'; // Aquí deberías obtener el DNI del paciente autenticado
    $sql = "SELECT medicamento.nombre, cita_medicamento.cantidad AS posologia, cita_medicamento.duracion AS hasta 
            FROM cita_medicamento 
            JOIN medicamento ON cita_medicamento.id_medicamento = medicamento.id 
            JOIN cita ON cita_medicamento.id_cita = cita.id 
            JOIN paciente ON cita.id_paciente = paciente.id 
            WHERE paciente.dni = '$dni'";
    $result = $conexion->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function obtenerConsultasPasadas() {
    global $conexion;
    $dni = '12345678A'; // Aquí deberías obtener el DNI del paciente autenticado
    $sql = "SELECT cita.id, cita.fecha 
            FROM cita 
            JOIN paciente ON cita.id_paciente = paciente.id 
            WHERE paciente.dni = '$dni' AND cita.fecha < CURDATE()";
    $result = $conexion->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function obtenerDetalleConsulta($idConsulta) {
    global $conexion;
    $sql = "SELECT cita.*, medico.nombre AS medico, medico.especialidad 
            FROM cita 
            JOIN medico ON cita.id_medico = medico.id 
            WHERE cita.id = $idConsulta";
    $result = $conexion->query($sql);
    $data = $result->fetch_assoc();
    echo json_encode($data);
}

function pedirCita($data) {
    global $conexion;
    $dni = '12345678A'; // Aquí deberías obtener el DNI del paciente autenticado
    $sqlPaciente = "SELECT id FROM paciente WHERE dni = '$dni'";
    $resultPaciente = $conexion->query($sqlPaciente);
    $paciente = $resultPaciente->fetch_assoc();
    $idPaciente = $paciente['id'];

    $idMedico = $data['medico'];
    $fecha = $data['fecha'];
    $sintomas = $data['sintomas'];

    $sql = "INSERT INTO cita (id_paciente, id_medico, fecha, sintomas) VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("iiss", $idPaciente, $idMedico, $fecha, $sintomas);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al pedir la cita']);
    }

    $stmt->close();
}

function obtenerMedicosDisponibles() {
    global $conexion;
    $dni = '12345678A'; // Aquí deberías obtener el DNI del paciente autenticado
    $sql = "SELECT medico.id, medico.nombre, medico.especialidad 
            FROM medico 
            JOIN paciente_medico ON medico.id = paciente_medico.id_medico 
            JOIN paciente ON paciente_medico.id_paciente = paciente.id 
            WHERE paciente.dni = '$dni'";
    $result = $conexion->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

$conexion->close();
?>