<?php
include_once 'conecta.php';

$action = $_GET['action'];
$dni = $_GET['dni']; // Obtener el DNI de la URL

switch ($action) {
    case 'info':
        obtenerInformacionMedico($dni);
        break;
    case 'proximasConsultas':
        obtenerProximasConsultas($dni);
        break;
    case 'consultasHoy':
        obtenerConsultasHoy($dni);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

function obtenerInformacionMedico($dni) {
    global $conexion;
    $sql = "SELECT nombre, especialidad FROM medico WHERE dni = '$dni'";
    $result = $conexion->query($sql);
    $data = $result->fetch_assoc();
    echo json_encode($data);
}

function obtenerProximasConsultas($dni) {
    global $conexion;
    $sql = "SELECT cita.id, paciente.nombre AS paciente, cita.fecha, cita.sintomas 
            FROM cita 
            JOIN paciente ON cita.id_paciente = paciente.id 
            JOIN medico ON cita.id_medico = medico.id 
            WHERE medico.dni = '$dni' AND cita.fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)";
    $result = $conexion->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function obtenerConsultasHoy($dni) {
    global $conexion;
    $sql = "SELECT cita.id, paciente.nombre AS paciente, cita.fecha, cita.sintomas 
            FROM cita 
            JOIN paciente ON cita.id_paciente = paciente.id 
            JOIN medico ON cita.id_medico = medico.id 
            WHERE medico.dni = '$dni' AND cita.fecha = CURDATE()";
    $result = $conexion->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

$conexion->close();
?>