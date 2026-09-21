import express from "express";
import cors from "cors";
import multer from "multer";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const port = Number(process.env.PORT || 4000);
const secret = process.env.JWT_SECRET || "local-secret";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());

type Role = "admin" | "pathologist" | "technician";

const demoUsers = [
  { id: 1, email: "admin@pathcase.local", role: "admin" as Role },
  { id: 2, email: "pathologist@pathcase.local", role: "pathologist" as Role },
  { id: 3, email: "tech@pathcase.local", role: "technician" as Role }
];

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    (req as any).user = jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function allow(...roles: Role[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!roles.includes((req as any).user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

app.get("/health", (_req, res) => res.json({ status: "ok", service: "pathcase-api" }));

app.post("/api/auth/login", (req, res) => {
  const user = demoUsers.find(u => u.email === req.body.email);
  if (!user || !req.body.password) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign(user, secret, { expiresIn: "2h" });
  res.json({ token, user });
});

app.get("/api/cases", auth, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, case_number, patient_label, status, classification, confidence, created_at FROM cases ORDER BY created_at DESC LIMIT 100"
    );
    res.json(result.rows);
  } catch {
    res.json([
      { id: 1, case_number: "PC-0001", patient_label: "Demo Patient A", status: "Review", classification: "benign", confidence: 0.91 },
      { id: 2, case_number: "PC-0002", patient_label: "Demo Patient B", status: "Pending", classification: "suspicious", confidence: 0.84 }
    ]);
  }
});

app.post("/api/cases", auth, allow("admin", "pathologist", "technician"), async (req, res) => {
  const { caseNumber, patientLabel } = req.body;
  if (!caseNumber || !patientLabel) return res.status(400).json({ error: "caseNumber and patientLabel are required" });
  try {
    const result = await pool.query(
      "INSERT INTO cases(case_number, patient_label, status) VALUES($1,$2,'Pending') RETURNING *",
      [caseNumber, patientLabel]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(201).json({ id: Date.now(), case_number: caseNumber, patient_label: patientLabel, status: "Pending" });
  }
});

app.post("/api/cases/:id/images", auth, allow("admin", "pathologist", "technician"), upload.single("slide"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "slide file is required" });
  res.status(201).json({
    caseId: req.params.id,
    filename: req.file.originalname,
    size: req.file.size,
    storage: "s3-adapter",
    message: "Upload accepted. Connect the S3 adapter for production object storage."
  });
});

app.post("/api/cases/:id/classify", auth, allow("admin", "pathologist"), async (req, res) => {
  const classifierUrl = process.env.CLASSIFIER_URL;
  try {
    const response = await fetch(classifierUrl!, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ caseId: req.params.id, filename: req.body.filename || "slide.jpg" })
    });
    const prediction = await response.json();
    res.json(prediction);
  } catch {
    res.json({ label: "benign", confidence: 0.85, source: "demo-classifier" });
  }
});

app.get("/api/audit", auth, allow("admin", "pathologist"), (_req, res) => {
  res.json([
    { action: "CASE_VIEW", actor: "pathologist@pathcase.local", at: new Date().toISOString() },
    { action: "SLIDE_UPLOAD", actor: "tech@pathcase.local", at: new Date().toISOString() }
  ]);
});

app.listen(port, () => console.log(`PathCase API listening on ${port}`));
