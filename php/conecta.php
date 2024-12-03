<?php
$host = "localhost";
$usuario = "root";
$password = "";
$dbname = "ambulatorio";

// Conexión al servidor de MySQL
$conexion = new mysqli($host, $usuario, $password);

// Verifica la conexión 
if ($conexion->connect_error) {
    die("Error al conectar con la base de datos: " . $conexion->connect_error);
}

// Verificar si la base de datos existe
$sql = "SHOW DATABASES LIKE '$dbname'";
$query = $conexion->query($sql);

// Si no existe la creo
if ($query->num_rows <= 0) {
    $sql = "CREATE DATABASE $dbname";
    if (!$conexion->query($sql)) {
        die("Error al crear la base de datos: " . $conexion->error);
    }
    // echo "Base de datos creada correctamente.";
} else {
    // echo "La base de datos ya existe.";
}

// Selecciono la base de datos
if (!$conexion->select_db($dbname)) {
    die("Error al seleccionar la base de datos: " . $conexion->error);
}
?>