<?php
include_once 'conecta.php';

$dni = $_POST['dni'];
$contra = $_POST['contra'];
$rol = $_POST['rol'];

if ($rol === 'Paciente') {
    $sql = "SELECT * FROM paciente WHERE dni = '$dni' AND contra = '$contra'";
} else {
    $sql = "SELECT * FROM medico WHERE dni = '$dni' AND contra = '$contra'";
}

$result = $conexion->query($sql);

if ($result->num_rows > 0) {
    echo json_encode(['success' => true, 'rol' => $rol]);
} else {
    echo json_encode(['success' => false]);
}

$conexion->close();
?>