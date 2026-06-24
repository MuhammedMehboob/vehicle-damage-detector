# 🚗 Vehicle Damage Detector

An end-to-end deep learning system that classifies vehicle damage severity and location from a single photo - built from raw dataset to a deployed, public-facing web app.

**🔴 Live Demo:** [muhammed19-vehicle-damage-estimator.hf.space](https://muhammed19-vehicle-damage-estimator.hf.space)


---

## What it does

Upload a photo of a vehicle's front or rear end, and the system returns:
- **Damage severity** — No Damage / Moderate / Critical
- **Damage location** — e.g. Front End, Rear End
- **Classification** — e.g. Rear Crushed, Bumper Dented
- **A short assessment and recommended action plan**

This kind of automated triage is the same problem insurance claims processing and used-car inspection platforms solve — this project replicates that pipeline end-to-end.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌────────────────────┐
│   Frontend   │ ───► │   FastAPI    │ ───► │  ResNet-50 (CNN)   │
│ HTML/CSS/JS  │ ◄─── │   Backend    │ ◄─── │  PyTorch, .pth     │
└─────────────┘      └──────────────┘      └────────────────────┘
      │                      │
      │                      │
   User uploads          Image preprocessing,
   vehicle photo         inference, response
                          formatting (JSON)

Deployed as a single Docker container on Hugging Face Spaces
```

| Layer | Tech | Notes |
|---|---|---|
| Model | ResNet-50 (transfer learning, fine-tuned) | Trained in `notebook/`, see below |
| Training | PyTorch, Jupyter Notebook | My core work — data prep, training, hyperparameter tuning |
| Backend | FastAPI | My core work — inference API, model serving |
| Frontend | HTML, CSS, JavaScript | UI scaffolding, AI-assisted |
| Deployment | Docker + Hugging Face Spaces | |

> **Note:** the model training and FastAPI backend are my own work. The frontend UI was AI-assisted to make the project demoable end-to-end — my focus on this project was the CV pipeline and serving it, not frontend design.

## Repository structure

```
notebook/   → data preprocessing, training, hyperparameter tuning (PyTorch)
app/        → FastAPI backend + frontend, deployed as the live Hugging Face Space
```

**Model weights (90MB) and dataset (637MB, 2,300+ images) are not included in this repo** — see the Hugging Face Space for the live deployed model, and the dataset citation below for the source data.

Each folder has its own README with setup/run instructions.

## Dataset

Trained on a vehicle damage image dataset published in [this paper](https://www.sciencedirect.com/science/article/pii/S2405844024100473) (ScienceDirect, 2024), used here strictly for academic/educational purposes. Full citation in `notebook/README.md`.

## Model Performance

### Overall Metrics

| Metric | Score |
|----------|----------|
| Accuracy | 80% |
| Weighted F1-Score | 0.80 |
| Macro F1-Score | 0.79 |
| Test Samples | 575 |
| Number of Classes | 6 |

### Per-Class Performance

| Class | Precision | Recall | F1-Score |
|---------|---------:|---------:|---------:|
| 0 | 0.78 | 0.90 | 0.84 |
| 1 | 0.83 | 0.70 | 0.76 |
| 2 | 0.89 | 0.89 | 0.89 |
| 3 | 0.71 | 0.85 | 0.78 |
| 4 | 0.75 | 0.64 | 0.69 |
| 5 | 0.78 | 0.79 | 0.79 |

**Summary:** The fine-tuned ResNet-50 model achieved **80% overall accuracy** and a **0.80 weighted F1-score** across six vehicle damage categories, demonstrating strong and balanced classification performance.
## Running locally

```bash
# 1. Clone
git clone https://github.com/MuhammedMehboob/vehicle-damage-detector
cd vehicle-damage-detector

# 2. Backend + frontend (served together via FastAPI)
cd app
pip install -r requirements.txt
# Note: you'll need the model .pth file locally — download from the HF Space
# or retrain using notebook/damage_prediction.ipynb
uvicorn server:app --reload
```

Then open `http://localhost:8000` in your browser.

## Future improvements

- [ ] Expand to side-angle and multi-angle damage detection
- [ ] Add cost-estimation based on damage class
- [ ] Replace plain JS frontend with React for richer UX
- [ ] Add model explainability (e.g. Grad-CAM) to show which region drove the prediction

