const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { exec } = require("child_process");
const WebSocket = require('ws');
const User = require("./models/User");
const Repository = require("./models/Repository");
const vhost = require('vhost');

const app = express();
const PORT = process.env.PORT || 1000;
const MONGODB_URI = "mongodb://localhost:27017/vercel";

app.use(cors());
app.use(express.json());

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New client connected');
  ws.send('Sistemas Listos!');
});

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Conectado a MongoDB");
})
.catch((err) => {
  console.error("Error al conectar a MongoDB", err);
});

app.post("/createUser", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    console.log('User created:', user);
    res.status(201).send(user);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(400).send(err);
  }
});

app.post("/createRepository", async (req, res) => {
  try {
    console.log(req.headers);
    
    const userGit = req.headers.usergit;
    const nameArchive = req.headers.namearchive;
    const port = req.headers.port;
    const idMail = req.headers.idmail;
    const command = req.headers.command;

    if (!userGit || !nameArchive) {
      throw new Error("userGit and nameArchive are required");
    }

    const repository = new Repository({
      userGit,
      nameArchive,
      port,
      idMail,
      command
    });

    await repository.save();

    console.log('Repository created:', repository);
    res.status(201).send(repository);
  } catch (err) {
    console.error('Error creating repository:', err);
    res.status(400).send(err);
  }
});

app.post("/deployGit", async (req, res) => {
  try {
    const { urlGit, nameArchive, userGit, command, port } = req.body;

    const process = exec(`git clone ${urlGit} ./${userGit}/${nameArchive}`);
    
    process.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`stdout: ${data}`);
        }
      });
    });

    process.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`stderr: ${data}`);
        }
      });
    });

    process.on('close', async (code) => {
      if (code === 0) {
        console.log(`Repositorio clonado exitosamente en: ./${userGit}/${nameArchive}`);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(`Repositorio clonado exitosamente`);
          }
        });

        try {
          const vhostDomain = `${nameArchive}-localhost:${port}`;
          const redirectUrl = `http://${vhostDomain}`;
          
          await startProject(userGit, nameArchive, command, wss, port);

          app.use(vhost(vhostDomain, (req, res) => {
            res.redirect(redirectUrl);
          }));

          res.status(201).send({ message: "Repositorio clonado e inicializado exitosamente", url: redirectUrl });
        } catch (err) {
          console.error('Error initializing project:', err);
          res.status(500).send({ error: "Error al inicializar el proyecto" });
        }
      } else {
        const errorMessage = `Proceso terminado con código de error: ${code}`;
        console.error(errorMessage);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(errorMessage);
          }
        });
        res.status(500).send({ error: errorMessage });
      }
    });
  } catch (err) {
    console.error('Error in deployGit:', err);
    res.status(400).send(err);
  }
});

app.get("/getUserData", async (req, res) => {
  try {
    const { emaildata } = req.headers;
    const user = await User.findOne({ email: emaildata });
    if (user) {
      console.log('User found:', user);
      res.status(200).send(user);
    } else {
      console.log('User not found');
      res.status(404).send({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error getting user data:', err);
    res.status(400).send(err);
  }
});

app.get("/getDataRepository", async (req, res) => {
  try {
    console.log(req.headers, "getDataRepository");
    const repository = await Repository.find( req.headers.idMail );
    if (repository) {
      console.log('Repository found:', repository);
      res.status(200).send(repository);
    } else {
      console.log('Repository not found');
      res.status(404).send({ error: 'Repository not found' });
    }
  } catch (err) {
    console.error('Error getting repository data:', err);
    res.status(400).send(err);
  }
});

app.post("/startUserProyect", async (req, res) => {
  try {
    console.log(req.body)
    const { userGit, nameArchive, command, port } = req.body;

    if (!userGit || !nameArchive || !command || !port) {
      throw new Error("Todos los campos son obligatorios: userGit, nameArchive, command, port");
    }

    console.log(`Iniciando el proyecto para el repositorio ${nameArchive} del usuario ${userGit} en el puerto ${port}`);

    await startProject(userGit, nameArchive, command, wss, port);

    console.log(`Proyecto ${nameArchive} iniciado en el puerto ${port}`);
    res.status(200).send({ message: `Proyecto ${nameArchive} iniciado en el puerto ${port}` });
  } catch (err) {
    console.error('Error starting user project:', err);
    res.status(400).send({ error: err.message });
  }
});

app.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit('connection', socket, request);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor está corriendo en http://localhost:${PORT}`);
});

async function startProject(userGit, nameArchive, command, wss, port) {
  return new Promise((resolve, reject) => {
    console.log("Inicializando el proyecto...");

    const vhostDomain = `${nameArchive}.local:${port}`;

    const initProcess = exec(`cd ./${userGit}/${nameArchive} && npm install && ${command}`);

    initProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`stdout: ${data}`);
        }
      });
    });

    initProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`stderr: ${data}`);
        }
      });
    });

    initProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`Proyecto inicializado correctamente y disponible en ${vhostDomain}`);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(`Proyecto inicializado correctamente y disponible en ${vhostDomain}`);
          }
        });
        resolve();
      } else {
        const errorMessage = `Proceso terminado con código de error: ${code}`;
        console.error(errorMessage);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(errorMessage);
          }
        });
        reject(new Error(errorMessage));
      }
    });
  });
}
