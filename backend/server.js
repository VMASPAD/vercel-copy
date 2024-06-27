// server.js
const express = require('express');
const vhost = require('vhost');

const app = express();

// Configuración del servidor para mi-dominio.local
const miDominioApp = express();
miDominioApp.get('/', (req, res) => {
  res.send('Contenido para mi-dominio.local.');
});

// Configuración del servidor para dominio.local
const dominioApp = express();
dominioApp.get('/', (req, res) => {
  res.send('Contenido para dominio.local.');
});

// Middleware para manejar las rutas con vhost
app.use(vhost('mi-dominio.local', miDominioApp));
app.use(vhost('dominio.local', dominioApp));

// Middleware para cualquier otro dominio
app.use((req, res) => {
  res.send('Has accedido a un dominio no configurado.');
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Accede a http://mi-dominio.local:${PORT} o http://dominio.local:${PORT}`);
});
