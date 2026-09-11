"""
CropGuard AI - Dataset Preparation, Cleaning & Stratified Splitting Script
Handles data ingestion, image validation, class balancing, and 70/15/15 split.
"""

import os
import shutil
import argparse
from pathlib import Path
from PIL import Image
import numpy as np
from sklearn.model_selection import train_test_split
from collections import Counter

VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}

def validate_and_clean_image(image_path: Path, min_dim: int = 128) -> bool:
    """Verifies that the image can be loaded, is RGB, and is not corrupt or blank."""
    try:
        with Image.open(image_path) as img:
            img.verify()
        with Image.open(image_path) as img:
            img = img.convert('RGB')
            w, h = img.size
            if w < min_dim or h < min_dim:
                return False
            # Check for near-solid black or white images
            arr = np.array(img)
            if np.std(arr) < 8.0:
                return False
            return True
    except Exception:
        return False

def prepare_dataset(raw_dir: str, output_dir: str, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42):
    raw_path = Path(raw_dir)
    out_path = Path(output_dir)

    print(f"[*] Scanning raw dataset directory: {raw_path}")
    classes = [d.name for d in raw_path.iterdir() if d.is_dir() and not d.name.startswith('.')]
    print(f"[*] Found {len(classes)} crop disease classes: {classes}")

    all_samples = []
    all_labels = []

    for class_idx, class_name in enumerate(classes):
        class_folder = raw_path / class_name
        valid_files = 0
        for f in class_folder.iterdir():
            if f.suffix.lower() in VALID_EXTENSIONS:
                if validate_and_clean_image(f):
                    all_samples.append(f)
                    all_labels.append(class_name)
                    valid_files += 1
        print(f"  -> Class '{class_name}': {valid_files} verified healthy/diseased leaf images.")

    class_counts = Counter(all_labels)
    print(f"[*] Class distribution before split: {class_counts}")

    # Stratified split: Train (70%), Temp (30%)
    train_files, temp_files, train_labels, temp_labels = train_test_split(
        all_samples, all_labels,
        test_size=(val_ratio + test_ratio),
        stratify=all_labels,
        random_state=seed
    )

    # Split temp (30%) into Val (15%) and Test (15%)
    val_files, test_files, val_labels, test_labels = train_test_split(
        temp_files, temp_labels,
        test_size=0.5,
        stratify=temp_labels,
        random_state=seed
    )

    print(f"[*] Split summary: {len(train_files)} Train, {len(val_files)} Val, {len(test_files)} Test")

    splits = {
        'train': (train_files, train_labels),
        'val': (val_files, val_labels),
        'test': (test_files, test_labels)
    }

    for split_name, (files, labels) in splits.items():
        split_dir = out_path / split_name
        for file_path, label in zip(files, labels):
            dest_folder = split_dir / label
            dest_folder.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, dest_folder / file_path.name)

    print(f"[✓] Dataset preparation and stratified export complete at: {output_dir}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="CropGuard AI Dataset Preparation")
    parser.add_argument("--data_dir", type=str, default="./data/raw", help="Path to raw image classes")
    parser.add_argument("--output_dir", type=str, default="./data/processed", help="Target directory for processed splits")
    args = parser.parse_args()
    # If run in demo mode without files, display usage message
    if not os.path.exists(args.data_dir):
        print(f"[!] Directory {args.data_dir} not found. Place dataset classes under {args.data_dir}/<class_name>/*.jpg")
    else:
        prepare_dataset(args.data_dir, args.output_dir)
