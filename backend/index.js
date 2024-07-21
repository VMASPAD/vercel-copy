const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { exec } = require("child_process");
const WebSocket = require("ws");
const vhost = require("vhost");
const path = require("path");

const User = require("./models/User");
const Repository = require("./models/Repository");

const app = express();
const PORT = process.env.PORT || 1000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vercel";
const WS_PORT = process.env.WS_PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket server
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.send("Systems Ready!");
});

// Database connection
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// Helper functions
const sendWebSocketMessage = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const executeCommand = (command, cwd) => {
  return new Promise((resolve, reject) => {
    const process = exec(command, { cwd });

    process.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      sendWebSocketMessage(`stdout: ${data}`);
    });

    process.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      sendWebSocketMessage(`stderr: ${data}`);
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
};

// Routes
app.post("/createUser", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    console.log("User created:", user);
    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(400).json({ error: err.message });
  }
});

app.post("/createRepository", async (req, res) => {
  try {
    const { usergit, namearchive, port, email, idmail, command } = req.headers;
    if (!usergit || !namearchive) {
      throw new Error("usergit and nameArchive are required");
    }

    const repository = new Repository({
      usergit,
      namearchive,
      port,
      email,
      idmail,
      command,
    });

    await repository.save();
    console.log("Repository created:", repository);
    res.status(201).json(repository);
  } catch (err) {
    console.error("Error creating repository:", err);
    res.status(400).json({ error: err.message });
  }
});

app.post("/deployGit", async (req, res) => {
  const { urlGit, namearchive, usergit, command, port, email } = req.body;
  const projectPath = path.join(email, usergit, namearchive);
  try {
    await executeCommand(`git clone ${urlGit} ${projectPath}`);
    console.log(`Repository cloned successfully in: ${projectPath}`);
    sendWebSocketMessage("Repository cloned successfully");

    const vhostDomain = `${namearchive}-localhost:${port}`;
    const redirectUrl = `http://${vhostDomain}`;

    await startProject(usergit, namearchive, command, port, email);

    app.use(
      vhost(vhostDomain, (req, res) => {
        res.redirect(redirectUrl);
      })
    );

    res
      .status(201)
      .json({
        message: "Repository cloned and initialized successfully",
        url: redirectUrl,
      });
  } catch (err) {
    console.error("Error in deployGit:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/getDataUser", async (req, res) => {
  try {
    const { emaildata, idmail, pass } = req.headers;
    console.log("getDataUser" + JSON.stringify(req.headers));
    const user = await User.findOne({
      ...(emaildata && { email: emaildata }),
      ...(pass && { pass: pass }),
      ...(idmail && { id: idmail }),
    });
    if (user) {
      console.log("User found:", user);
      res.status(200).json(user);
    } else {
      console.log("User not found");
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error getting user data:", err);
    res.status(400).json({ error: err.message });
  }
});

app.get("/getDataRepository", async (req, res) => {
  try {
    const { idmail, email } = req.headers;
    const repositories = await Repository.find({
      idmail: idmail,
      email: email,
    });

    if (repositories.length > 0) {
      console.log("Repositories found:", repositories);
      res.status(200).json(repositories);
    } else {
      console.log("No repositories found");
      res.status(404).json({ error: "No repositories found" });
    }
  } catch (err) {
    console.error("Error getting repository data:", err);
    res.status(400).json({ error: err.message });
  }
});

app.post("/startUserProject", async (req, res) => {
  try {
    const { userGit, nameArchive, command, port, email } = req.body;

    if (!userGit || !nameArchive || !command || !port) {
      throw new Error(
        "All fields are required: userGit, nameArchive, command, port"
      );
    }

    console.log(
      `Starting project for repository ${nameArchive} of user ${userGit} on port ${port}`
    );

    await startProject(userGit, nameArchive, command, port, email);

    console.log(`Project ${nameArchive} started on port ${port}`);
    res
      .status(200)
      .json({ message: `Project ${nameArchive} started on port ${port}` });
  } catch (err) {
    console.error("Error starting user project:", err);
    res.status(400).json({ error: err.message });
  }
});

async function startProject(userGit, nameArchive, command, port, email) {
  const projectPath = path.join(email, userGit, nameArchive);
  const vhostDomain = `${nameArchive}.local:${port}`;

  console.log("Initializing the project...");
  await executeCommand(`npm install && ${command}`, projectPath);

  console.log(
    `Project initialized successfully and available at ${vhostDomain}`
  );
  sendWebSocketMessage(
    `Project initialized successfully and available at ${vhostDomain}`
  );
}

// WebSocket upgrade
app.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
