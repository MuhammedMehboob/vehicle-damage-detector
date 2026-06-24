# Training Notebook

Contains the full training pipeline for the vehicle damage classifier:
- `damage_prediction.ipynb` — data loading, preprocessing, model definition (ResNet-50 transfer learning), training loop, evaluation
- `hyperparameter_tunning.ipynb` — learning rate / hyperparameter search

## Dataset

[Add full citation: Authors, "Title of paper," *Journal name*, 2024.](https://www.sciencedirect.com/science/article/pii/S2405844024100473)

Used here strictly for academic/non-commercial purposes. The dataset (637MB, 2,300+ images) is not included in this repo — see the paper above for access. Please cite the original authors if you reuse this dataset.

## How to run

```bash
pip install torch torchvision jupyter pandas numpy matplotlib  # or see notebook imports
jupyter notebook damage_prediction.ipynb
```

## Results

[Add final metrics here, e.g.:
- Validation accuracy: __%
- Classes: No Damage / Moderate / Critical
- Confusion matrix screenshot
- Sample predictions]
