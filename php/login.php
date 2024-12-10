<?php
include_once 'conecta.php';

// Establece el tipo de contenido de la respuesta HTTP a JSON
header('Content-Type: application/json'); 

$data = json_decode(file_get_contents("php://input"), true);
$dni = $data['dni'];
$contra = $data['contra'];
$rol = $data['rol'];

// Consulta SQL 
if ($rol === 'paciente') {
    $sql = "SELECT * FROM paciente WHERE dni = ?";
} else {
    $sql = "SELECT * FROM medico WHERE dni = ?";
}

$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $dni); // Vincular el valor de $dni a la consulta preparada (string).
$stmt->execute();
$result = $stmt->get_result();

$response = [];

// Verifico si hay resultados
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc(); // Obtengo los datos del usuario como un array asociativo

    // Redirección adecuada para cada rol
    if ($contra === $user['contra']) {
        $redirect = $rol === 'paciente' ? 'html/paciente.html?dni=' . $dni : 'html/medico.html?dni=' . $dni;
        $response = ['success' => true, 'redirect' => $redirect];
    } else {
        $response = ['success' => false, 'message' => 'Contraseña incorrecta.'];
    }
} else {
    $response = ['success' => false, 'message' => 'Usuario no encontrado.'];
}

echo json_encode($response);

$stmt->close();
$conexion->close();
?>