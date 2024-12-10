<?php
include_once 'conecta.php';

// Obtengo la acción y el DNI de la URL
$action = $_GET['action'];
$dni = $_GET['dni'];

switch ($action) {
    case 'info':
        obtenerInformacionPaciente($dni);
        break;
    case 'proximasCitas':
        obtenerProximasCitas($dni);
        break;
    case 'medicacionActual':
        obtenerMedicacionActual($dni);
        break;
    case 'consultasPasadas':
        obtenerConsultasPasadas($dni);
        break;
    case 'detalleConsulta':
        $idConsulta = $_GET['id'];
        obtenerDetalleConsulta($idConsulta);
        break;
    case 'pedirCita':
        $data = json_decode(file_get_contents("php://input"), true);
        pedirCita($data, $dni);
        break;
    case 'medicosDisponibles':
        obtenerMedicosDisponibles($dni);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

function obtenerInformacionPaciente($dni) {
    global $conexion; //Utilizo la variable global $conexion para acceder a la conexión de la base de datos establecida previamente.
    $sql = "SELECT nombre, informacion FROM paciente WHERE dni = '$dni'"; 
    $result = $conexion->query($sql);
    $data = $result->fetch_assoc(); //Utilizo el método fetch_assoc para obtener la fila de resultados como un array asociativo.
    echo json_encode($data); //Codifico el array $data como JSON y lo envío como respuesta.
}

function obtenerProximasCitas($dni) {
    global $conexion;
    $sql = "SELECT cita.id, medico.nombre AS medico, cita.fecha 
            FROM cita 
            JOIN medico ON cita.id_medico = medico.id 
            JOIN paciente ON cita.id_paciente = paciente.id 
            WHERE paciente.dni = '$dni' AND cita.fecha >= CURDATE()"; //Utilizo JOIN para combinar las tablas cita, medico y paciente basándome en las claves foráneas id_medico y id_paciente.
    $result = $conexion->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function obtenerMedicacionActual($dni) {
    global $conexion;
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

function obtenerConsultasPasadas($dni) {
    global $conexion;
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
    header('Content-Type: application/json');
    global $conexion;
    $sql = "SELECT cita.*, medico.nombre AS medico, medico.especialidad 
            FROM cita 
            JOIN medico ON cita.id_medico = medico.id 
            WHERE cita.id = $idConsulta";
    $result = $conexion->query($sql);

    if (!$result) {
        echo json_encode(['success' => false, 'message' => 'Error al obtener los detalles de la consulta']);
        return;
    }

    $data = $result->fetch_assoc();

    if ($data) {
        echo json_encode($data);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontraron detalles para la consulta']);
    }
}

function pedirCita($data, $dni) {
    global $conexion;
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

function obtenerMedicosDisponibles($dni) {
    global $conexion;
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