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


