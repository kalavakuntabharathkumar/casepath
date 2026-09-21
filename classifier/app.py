from fastapi import FastAPI
from pydantic import BaseModel
import hashlib

app = FastAPI(title="PathCase Classifier Demo")

class PredictionRequest(BaseModel):
    caseId: str | int
    filename: str = "slide.jpg"

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(payload: PredictionRequest):
    # Deterministic demo adapter. Replace this endpoint with a real
    # pretrained pathology model service for production.
    value = int(hashlib.sha256(payload.filename.encode()).hexdigest()[:2], 16)
    label = "suspicious" if value % 3 == 0 else "benign"
    confidence = round(0.80 + (value % 16) / 100, 2)
    return {"label": label, "confidence": confidence, "source": "demo-classifier"}
