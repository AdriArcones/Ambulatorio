<?php
include_once 'conecta.php';

// Función para verificar si una tabla existe
function verificarTabla($conexion, $tabla) {
    $sql = "SHOW TABLES LIKE '$tabla'";
    $query = mysqli_query($conexion, $sql) or die("Error al verificar la tabla '$tabla': " . mysqli_error($conexion));
    return mysqli_fetch_array($query) > 0;
}

// Verificar y crear la tabla 'paciente'
if (!verificarTabla($conexion, 'paciente')) {
    $sql_paciente = "CREATE TABLE paciente (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        informacion TEXT,
        dni VARCHAR(9) UNIQUE NOT NULL,
        contra VARCHAR(255) NOT NULL
    )";
    mysqli_query($conexion, $sql_paciente) or die("Error al crear la tabla 'paciente': " . mysqli_error($conexion));

    // Insertar datos en la tabla 'paciente'
    $insert_pacientes = "INSERT INTO paciente (nombre, informacion, dni, contra) VALUES
        ('Juan Pérez', 'Paciente con antecedentes de diabetes', '12345678A', '1234'),
        ('María Gómez', 'Paciente con dolores crónicos de cabeza', '12345678B', '1234')";
    mysqli_query($conexion, $insert_pacientes) or die("Error al insertar datos en 'paciente': " . mysqli_error($conexion));
}

// Verificar y crear la tabla 'medico'
if (!verificarTabla($conexion, 'medico')) {
    $sql_medico = "CREATE TABLE medico (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        especialidad ENUM('CABECERA', 'PEDIATRÍA', 'TRAUMATOLOGÍA') NOT NULL,
        dni VARCHAR(9) UNIQUE NOT NULL,
        contra VARCHAR(255) NOT NULL
    )";
    mysqli_query($conexion, $sql_medico) or die("Error al crear la tabla 'medico': " . mysqli_error($conexion));

    // Insertar datos en la tabla 'medico'
    $insert_medicos = "INSERT INTO medico (nombre, especialidad, dni, contra) VALUES
        ('Dr. Fernández', 'CABECERA', '12345678Y', '1234'),
        ('Dra. López', 'PEDIATRÍA', '12345678Z', '1234')";
    mysqli_query($conexion, $insert_medicos) or die("Error al insertar datos en 'medico': " . mysqli_error($conexion));
}

// Verificar y crear la tabla 'cita'
if (!verificarTabla($conexion, 'cita')) {
    $sql_cita = "CREATE TABLE cita (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_paciente INT NOT NULL,
        id_medico INT NOT NULL,
        fecha DATE NOT NULL,
        sintomas TEXT,
        diagnostico TEXT,
        pdf VARCHAR(255),
        FOREIGN KEY (id_paciente) REFERENCES paciente(id),
        FOREIGN KEY (id_medico) REFERENCES medico(id)
    )";
    mysqli_query($conexion, $sql_cita) or die("Error al crear la tabla 'cita': " . mysqli_error($conexion));

    // Insertar datos en la tabla 'cita'
    $insert_citas = "INSERT INTO cita (id_paciente, id_medico, fecha, sintomas, diagnostico, pdf) VALUES 
        (1, 1, '2024-12-01', 'Dolor abdominal', 'Gastritis leve', 'citas/diagnostico1.pdf'),
        (2, 2, '2024-12-02', 'Mareos constantes', 'Hipotensión', 'citas/diagnostico2.pdf')";
    mysqli_query($conexion, $insert_citas) or die("Error al insertar datos en 'cita': " . mysqli_error($conexion));
}

// Verificar y crear la tabla 'medicamento'
if (!verificarTabla($conexion, 'medicamento')) {
    $sql_medicamento = "CREATE TABLE medicamento (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL
    )";
    mysqli_query($conexion, $sql_medicamento) or die("Error al crear la tabla 'medicamento': " . mysqli_error($conexion));

    // Insertar datos en la tabla 'medicamento'
    $insert_medicamentos = "INSERT INTO medicamento (nombre) VALUES 
        ('Paracetamol'),
        ('Ibuprofeno')";
    mysqli_query($conexion, $insert_medicamentos) or die("Error al insertar datos en 'medicamento': " . mysqli_error($conexion));
}

// Verificar y crear la tabla 'cita_medicamento'
if (!verificarTabla($conexion, 'cita_medicamento')) {
    $sql_cita_medicamento = "CREATE TABLE cita_medicamento (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_cita INT NOT NULL,
        id_medicamento INT NOT NULL,
        cantidad VARCHAR(100),
        frecuencia VARCHAR(100),
        duracion INT,
        cronico BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (id_cita) REFERENCES cita(id),
        FOREIGN KEY (id_medicamento) REFERENCES medicamento(id)
    )";
    mysqli_query($conexion, $sql_cita_medicamento) or die("Error al crear la tabla 'cita_medicamento': " . mysqli_error($conexion));

    // Insertar datos en la tabla 'cita_medicamento'
    $insert_cita_medicamento = "INSERT INTO cita_medicamento (id_cita, id_medicamento, cantidad, frecuencia, duracion) VALUES 
        (1, 1, '1 tableta', 'cada 8h', 7),
        (2, 2, '1 cápsula', 'cada 12h', 5)";
    mysqli_query($conexion, $insert_cita_medicamento) or die("Error al insertar datos en 'cita_medicamento': " . mysqli_error($conexion));
}

// Verificar y crear la tabla 'paciente_medico'
if (!verificarTabla($conexion, 'paciente_medico')) {
    $sql_paciente_medico = "CREATE TABLE paciente_medico (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_paciente INT NOT NULL,
        id_medico INT NOT NULL,
        FOREIGN KEY (id_paciente) REFERENCES paciente(id),
        FOREIGN KEY (id_medico) REFERENCES medico(id)
    )";
    mysqli_query($conexion, $sql_paciente_medico) or die("Error al crear la tabla 'paciente_medico': " . mysqli_error($conexion));

    // Insertar datos en la tabla 'paciente_medico'
    $insert_paciente_medico = "INSERT INTO paciente_medico (id_paciente, id_medico) VALUES 
        (1, 1),
        (1, 2),
        (2, 2)";
    mysqli_query($conexion, $insert_paciente_medico) or die("Error al insertar datos en 'paciente_medico': " . mysqli_error($conexion));
}

echo "Tablas creadas y datos iniciales insertados correctamente.";

mysqli_close($conexion);
?>
