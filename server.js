const express = require("express");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const projectsFile = "projects.json";
const upload = multer({ dest: path.join(__dirname, "uploads") });

app.get("/api/messages", (req, res) => {
  let messages = [];
  if (fs.existsSync("messages.json")) {
    messages = JSON.parse(fs.readFileSync("messages.json"));
  }
  res.json(messages);
});

app.get("/api/messages", (req, res) => {
  let messages = [];
  if (fs.existsSync("messages.json")) {
    messages = JSON.parse(fs.readFileSync("messages.json"));
  }
  res.json(messages);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.delete("/api/messages/:index", (req, res) => {
  const idx = parseInt(req.params.index, 10);
  let messages = [];
  if (fs.existsSync("messages.json")) {
    messages = JSON.parse(fs.readFileSync("messages.json"));
  }
  if (isNaN(idx) || idx < 0 || idx >= messages.length) {
    return res.status(400).json({ error: "Index tidak valid" });
  }
  messages.splice(idx, 1);
  fs.writeFileSync("messages.json", JSON.stringify(messages, null, 2));
  res.json({ success: true });
});

// GET semua project
app.get("/api/projects", (req, res) => {
  let projects = [];
  if (fs.existsSync(projectsFile)) {
    projects = JSON.parse(fs.readFileSync(projectsFile));
  }
  res.json(projects);
});

// POST tambah project dengan upload gambar
app.post("/api/projects", upload.single("imgFile"), (req, res) => {
  const { title, description } = req.body;
  if (!title || !description || !req.file) {
    return res.status(400).json({ error: "Semua field wajib diisi." });
  }
  let projects = [];
  if (fs.existsSync(projectsFile)) {
    projects = JSON.parse(fs.readFileSync(projectsFile));
  }
  const imgPath = `/uploads/${req.file.filename}`;
  const newProject = { id: Date.now(), title, description, imgPath };
  projects.push(newProject);
  fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
  res.json(newProject);
});

// DELETE project
app.delete("/api/projects/:id", (req, res) => {
  let projects = [];
  if (fs.existsSync(projectsFile)) {
    projects = JSON.parse(fs.readFileSync(projectsFile));
  }
  const id = parseInt(req.params.id, 10);
  const newProjects = projects.filter((p) => p.id !== id);
  fs.writeFileSync(projectsFile, JSON.stringify(newProjects, null, 2));
  res.json({ success: true });
});

// PUT edit project (dengan upload gambar)
app.put("/api/projects/:id", upload.single("imgFile"), (req, res) => {
  let projects = [];
  if (fs.existsSync(projectsFile)) {
    projects = JSON.parse(fs.readFileSync(projectsFile));
  }
  const id = parseInt(req.params.id, 10);
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1)
    return res.status(404).json({ error: "Project tidak ditemukan" });

  // Update data
  projects[idx].title = req.body.title;
  projects[idx].description = req.body.description;
  if (req.file) {
    projects[idx].imgPath = `/uploads/${req.file.filename}`;
  }
  fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
  res.json(projects[idx]);
});
