# Training Notebook

Contains the full training pipeline for the vehicle damage classifier:
- `damage_prediction.ipynb` — data loading, preprocessing, model definition (ResNet-50 transfer learning), training loop, evaluation
- `hyperparameter_tunning.ipynb` — learning rate / hyperparameter search

## Dataset

Trained on the **Three-Quarter View Car Damage Dataset (TQVCD)**, introduced in:

> Lee, D., Lee, J., & Park, E. (2024). Automated vehicle damage classification using the three-quarter view car damage dataset and deep learning approaches. *Heliyon*, 10(14), e34016. https://doi.org/10.1016/j.heliyon.2024.e34016

Used here strictly for academic/non-commercial purposes. Full text and dataset access available via [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2405844024100473) / [PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC11298869/).

## How to run

```bash
pip install torch torchvision jupyter pandas numpy matplotlib  # or see notebook imports
jupyter notebook damage_prediction.ipynb
```

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


