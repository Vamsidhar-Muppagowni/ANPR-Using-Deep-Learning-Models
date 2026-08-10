# Indian License Plate Recognition Datasets

This archive contains two complementary datasets designed for building a robust Automatic Number Plate Recognition (ANPR) system tailored for Indian license plates. The datasets address unique challenges such as highly degraded plates, physical obstructions (e.g., flower garlands), multi-line square plates, and non-standard hand-painted commercial vehicle plates.

## 1. YOLO License Plate Detection Dataset (`yolo_dataset/`)
This dataset is designed for training object detection models (like YOLOv8) to accurately draw bounding boxes around license plates in high-resolution, uncropped images.

### Structure
- **Images**: Real-world photos of vehicles (cars, motorcycles, trucks, etc.) under various lighting conditions, angles, and occlusions.
- **Labels**: YOLO-formatted text files (`.txt`). Each file contains bounding box coordinates `[class_id center_x center_y width height]` normalized between 0 and 1.
- **Splits**: Divided into `train/` and `val/` directories for model training and evaluation.

## 2. CNN Character Recognition Dataset (`data/`)
This dataset is designed for training a Convolutional Neural Network (CNN) to recognize individual characters (A-Z, 0-9) cropped from license plates. It is particularly useful for building or fine-tuning custom OCR engines to handle highly stylized or degraded Indian fonts.

### Structure
- **Format**: Image classification folder structure.
- **Classes**: Directories named `class_0` to `class_35`, corresponding to the 36 alphanumeric characters (10 digits + 26 letters).
- **Images**: Tightly cropped images of individual characters extracted from license plates.
- **Splits**: Divided into `train/` and `val/` directories.

## Usage & Applications
These datasets were used to build a resilient two-stage ANPR pipeline:
1. **Detection**: A YOLO model trained on `yolo_dataset/` to locate the plate.
2. **Recognition**: An OCR engine (EasyOCR fallback combined with structural parsing and CNN validation trained on `data/`) to extract the exact alphanumeric string.

The pipeline successfully handles complex edge cases, such as merging multi-line text, inferring physically obstructed state codes (e.g., flowers blocking the state code), and applying structural rules to fix hallucinated characters (e.g., forcing a '0' to a 'Q' in the sequential letters section).
