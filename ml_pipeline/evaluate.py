"""
CropGuard AI - Model Evaluation & Performance Auditing Script
Computes Top-1, Top-3, Precision, Recall, F1 Score, and Confusion Matrix.
"""

import os
import argparse
import torch
import numpy as np
from pathlib import Path
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, top_k_accuracy_score
import json

from train import build_model, get_data_transforms, CropLeafDataset
from torch.utils.data import DataLoader

def evaluate_model(model_path, test_dir, batch_size=32):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"[*] Evaluating on {device} using checkpoint: {model_path}")

    checkpoint = torch.load(model_path, map_location=device)
    classes = checkpoint['classes']
    backbone = checkpoint.get('backbone', 'mobilenet_v3_small')
    num_classes = len(classes)

    model = build_model(num_classes, backbone=backbone, pretrained=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.to(device)
    model.eval()

    _, test_tf = get_data_transforms()
    test_ds = CropLeafDataset(test_dir, transform=test_tf)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)

    all_preds = []
    all_targets = []
    all_probs = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            _, preds = torch.max(probs, 1)

            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(labels.numpy())
            all_probs.append(probs.cpu().numpy())

    all_probs = np.vstack(all_probs)
    all_targets = np.array(all_targets)
    all_preds = np.array(all_preds)

    top1 = accuracy_score(all_targets, all_preds)
    top3 = top_k_accuracy_score(all_targets, all_probs, k=min(3, num_classes))

    print("\n" + "="*50)
    print(f" CROPGUARD AI - INDEPENDENT TEST BENCHMARK ")
    print("="*50)
    print(f"Top-1 Accuracy: {top1 * 100:.2f}%")
    print(f"Top-3 Accuracy: {top3 * 100:.2f}%")

    report = classification_report(all_targets, all_preds, target_names=classes, output_dict=True)
    print(f"Macro Precision: {report['macro avg']['precision'] * 100:.2f}%")
    print(f"Macro Recall:    {report['macro avg']['recall'] * 100:.2f}%")
    print(f"Macro F1-Score:  {report['macro avg']['f1-score'] * 100:.2f}%")
    print("="*50)

    cm = confusion_matrix(all_targets, all_preds)
    print("Confusion Matrix:")
    print(cm)

    results = {
        'top1_accuracy': float(top1),
        'top3_accuracy': float(top3),
        'macro_precision': float(report['macro avg']['precision']),
        'macro_recall': float(report['macro avg']['recall']),
        'macro_f1': float(report['macro avg']['f1-score']),
        'classes': classes,
        'confusion_matrix': cm.tolist()
    }

    with open('test_metrics.json', 'w') as f:
        json.dump(results, f, indent=2)

    print("[✓] Saved detailed audit metrics to test_metrics.json")
    return results

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model_path', type=str, default='./checkpoints/best_cropguard_model.pth')
    parser.add_argument('--test_dir', type=str, default='./data/processed/test')
    args = parser.parse_args()

    if not os.path.exists(args.model_path):
        print(f"[!] Checkpoint not found at {args.model_path}. Provide valid checkpoint path.")
    else:
        evaluate_model(args.model_path, args.test_dir)
