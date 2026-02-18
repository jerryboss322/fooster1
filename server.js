const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// Paths
const PUBLIC_DIR = path.join(__dirname, "public");
const UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads");
const DATA_DIR = path.join(__dirname, "data");
const CAMPAIGNS_JSON = path.join(DATA_DIR, "campaigns.json");

// Ensure directories exist
for (const dir of [PUBLIC_DIR, UPLOAD_DIR, DATA_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Basic data store
let campaigns = [];
if (fs.existsSync(CAMPAIGNS_JSON)) {
  try {
    const raw = fs.readFileSync(CAMPAIGNS_JSON, "utf8");
    campaigns = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read campaigns.json, starting empty:", e);
    campaigns = [];
  }
}

function saveCampaigns() {
  fs.writeFileSync(CAMPAIGNS_JSON, JSON.stringify(campaigns, null, 2), "utf8");
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// File upload setup
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (_req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  }
});

// API: list campaigns
app.get("/api/campaigns", (_req, res) => {
  res.json({ campaigns });
});

// API: create campaign with uploads
app.post("/api/campaigns", upload.array("media", 20), (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).send("Title is required");
  }

  if (!req.files || !req.files.length) {
    return res.status(400).send("At least one media file is required");
  }

  const media = req.files.map((file) => {
    // public URL for file
    const relativePath = path.relative(PUBLIC_DIR, file.path).replace(/\\/g, "/");
    return {
      filename: file.filename,
      url: `/${relativePath}`,
      mimetype: file.mimetype,
      size: file.size
    };
  });

  const campaign = {
    id: campaigns.length ? campaigns[campaigns.length - 1].id + 1 : 1,
    title,
    description: description || "",
    media,
    createdAt: new Date().toISOString()
  };

  campaigns.push(campaign);
  saveCampaigns();

  const recent = campaigns.slice(-5).map(c => ({
    title: c.title,
    description: c.description,
    media: c.media
  }));

  res.json({ ok: true, campaign, recent });
});

// Basic routes: serve portfolio homepage and admin
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.html", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/admin.html", (_req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

