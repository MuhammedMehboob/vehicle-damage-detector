# App — FastAPI Backend + Frontend

This is the deployed application — the same code running live at
[muhammed19-vehicle-damage-estimator.hf.space](https://muhammed19-vehicle-damage-estimator.hf.space).

## Contents

- `server.py` — FastAPI app: handles image upload, preprocessing, and inference
- `model_helper.py` — loads the trained ResNet-50 model and runs predictions
- `static/` — frontend (HTML/CSS/JS) served by FastAPI
- `Dockerfile` — container definition used for Hugging Face Spaces deployment
- `requirements.txt` — Python dependencies

## Model weights

The trained model (`.pth`, ~90MB) is **not included in this repo** to keep it lightweight.
To run this locally, either:
1. Download the weights from the [Hugging Face Space](https://muhammed19-vehicle-damage-estimator.hf.space) files, or
2. Train your own using `../notebook/damage_prediction.ipynb`

Place the resulting `.pth` file in `model/` before starting the server.

## Running locally

```bash
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

Then open `http://localhost:8000` in your browser.

## Running with Docker

```bash
docker build -t vehicle-damage-detector .
docker run -p 8000:8000 vehicle-damage-detector
```
