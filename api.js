const express = require('express');
const fs = require('fs');
const pc = require('picocolors');

const app = express();
const port = 5082;

// Cargamos los dos ficheros JSON (ruta relativa a este archivo)
const incidencias = require('./datos_api/incidencias.json');
const clientes = require('./datos_api/clientes.json');

// Permite leer JSON en el body de las peticiones
app.use(express.json());

// Logger: muestra método, URL y estado (verde si 2xx, rojo si 4xx)
app.use((req, res, next) => {
  res.on('finish', () => {
    const status = res.statusCode;
    const color = status < 400 ? pc.green(status) : pc.red(status);
    console.log(`${req.method} ${req.url} -> ${color}`);
  });
  next();
});

// ============================================================
// INCIDENCIAS (incidencias.json)
// ============================================================

// GET /api/incidencias -> todas
app.get('/api/incidencias', (req, res) => {
  res.json(incidencias);
});

// GET /api/incidencias/:codigo -> una por código (ej: H001)
app.get('/api/incidencias/:codigo', (req, res) => {
  const incidencia = incidencias.find(i => i.codigo === req.params.codigo);

  if (!incidencia) {
    return res.status(404).json({ error: 'Incidencia no encontrada' });
  }

  res.json(incidencia);
});

// POST /api/incidencias -> crear una nueva
app.post('/api/incidencias', (req, res) => {
  // Si hay 3 incidencias, la nueva es la 4 -> "H004"
  const numero = incidencias.length + 1;
  const codigo = 'H' + String(numero).padStart(3, '0');

  // El orden de los campos es el que pide el ejercicio
  const nuevaIncidencia = {
    codigo: codigo,
    titulo: req.body.titulo,
    prioridad: req.body.prioridad,
    fecha: req.body.fecha, // se guarda tal cual llega (sin new Date)
    descripcion: req.body.descripcion,
    estado: 'Pendiente'
  };

  incidencias.push(nuevaIncidencia);
  fs.writeFileSync('./datos_api/incidencias.json', JSON.stringify(incidencias, null, 2));

  res.status(201).json(nuevaIncidencia);
});

// ============================================================
// CLIENTES (clientes.json)
// ============================================================

// GET /api/clientes -> todos
app.get('/api/clientes', (req, res) => {
  res.json(clientes);
});

// GET /api/clientes/:id -> uno por id
app.get('/api/clientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const cliente = clientes.find(c => c.id === id);

  if (!cliente) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  res.json(cliente);
});

// POST /api/clientes -> crear uno nuevo
app.post('/api/clientes', (req, res) => {
  // id = el del último cliente + 1 (así no se repite aunque se borre alguno)
  const ultimo = clientes[clientes.length - 1];
  const nuevoId = ultimo ? ultimo.id + 1 : 1;

  const nuevoCliente = {
    id: nuevoId,
    nombre: req.body.nombre,
    email: req.body.email,
    telefono: req.body.telefono
  };

  clientes.push(nuevoCliente);
  fs.writeFileSync('./datos_api/clientes.json', JSON.stringify(clientes, null, 2));

  res.status(201).json(nuevoCliente);
});

// PUT /api/clientes/:id -> modificar
app.put('/api/clientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = clientes.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  clientes[index] = {
    id: id,
    nombre: req.body.nombre || clientes[index].nombre,
    email: req.body.email || clientes[index].email,
    telefono: req.body.telefono || clientes[index].telefono
  };

  fs.writeFileSync('./datos_api/clientes.json', JSON.stringify(clientes, null, 2));

  res.json(clientes[index]);
});

// DELETE /api/clientes/:id -> eliminar
app.delete('/api/clientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = clientes.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  clientes.splice(index, 1);
  fs.writeFileSync('./datos_api/clientes.json', JSON.stringify(clientes, null, 2));

  res.json({ mensaje: 'Cliente eliminado correctamente' });
});

// Cualquier otra ruta -> 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Arrancar el servidor
app.listen(port, () => {
  console.log(pc.green(`Servidor listo en http://127.0.0.1:${port}`));
});