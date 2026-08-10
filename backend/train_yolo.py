import os
import shutil
import random
import yaml
from ultralytics import YOLO

# Original dataset paths
ORIGINAL_DATASET_DIR = r"C:\Users\vamsi\Downloads\INP_Dataset\Kedar_Indian_Plates"
ORIGINAL_IMAGES_DIR = os.path.join(ORIGINAL_DATASET_DIR, "images")
ORIGINAL_LABELS_DIR = os.path.join(ORIGINAL_DATASET_DIR, "labels")

# Target dataset paths (inside the backend project)
TARGET_DATASET_DIR = os.path.join(os.path.dirname(__file__), "data", "yolo_dataset")
TRAIN_IMAGES_DIR = os.path.join(TARGET_DATASET_DIR, "train", "images")
TRAIN_LABELS_DIR = os.path.join(TARGET_DATASET_DIR, "train", "labels")
VAL_IMAGES_DIR = os.path.join(TARGET_DATASET_DIR, "val", "images")
VAL_LABELS_DIR = os.path.join(TARGET_DATASET_DIR, "val", "labels")

def prepare_dataset():
    print("Preparing YOLO dataset...")
    # Create directories
    for d in [TRAIN_IMAGES_DIR, TRAIN_LABELS_DIR, VAL_IMAGES_DIR, VAL_LABELS_DIR]:
        os.makedirs(d, exist_ok=True)

    # Get all image files
    valid_extensions = ('.jpg', '.jpeg', '.png')
    all_images = [f for f in os.listdir(ORIGINAL_IMAGES_DIR) if f.lower().endswith(valid_extensions)]
    
    # Shuffle for random split
    random.seed(42)
    random.shuffle(all_images)
    
    # Split 80/20
    split_index = int(len(all_images) * 0.8)
    train_images = all_images[:split_index]
    val_images = all_images[split_index:]

    def copy_files(image_list, target_img_dir, target_lbl_dir):
        copied_count = 0
        for img_name in image_list:
            base_name = os.path.splitext(img_name)[0]
            label_name = base_name + ".txt"
            
            src_img = os.path.join(ORIGINAL_IMAGES_DIR, img_name)
            src_lbl = os.path.join(ORIGINAL_LABELS_DIR, label_name)
            
            # Only copy if label exists
            if os.path.exists(src_lbl):
                dst_img = os.path.join(target_img_dir, img_name)
                dst_lbl = os.path.join(target_lbl_dir, label_name)
                
                shutil.copy2(src_img, dst_img)
                shutil.copy2(src_lbl, dst_lbl)
                copied_count += 1
        return copied_count

    print("Copying training data...")
    train_count = copy_files(train_images, TRAIN_IMAGES_DIR, TRAIN_LABELS_DIR)
    
    print("Copying validation data...")
    val_count = copy_files(val_images, VAL_IMAGES_DIR, VAL_LABELS_DIR)
    
    print(f"Dataset ready: {train_count} train samples, {val_count} val samples.")

    # Create data.yaml
    data_yaml_path = os.path.join(TARGET_DATASET_DIR, "data.yaml")
    yaml_content = {
        'path': TARGET_DATASET_DIR,
        'train': 'train/images',
        'val': 'val/images',
        'nc': 1,
        'names': ['license_plate']
    }
    
    with open(data_yaml_path, 'w') as f:
        yaml.dump(yaml_content, f, default_flow_style=False)
        
    print(f"data.yaml generated at {data_yaml_path}")
    return data_yaml_path

def train_model(data_yaml_path):
    print("Initializing YOLOv8 Nano model...")
    model = YOLO("yolov8n.pt")  # load a pretrained model
    
    print("Starting training (this may take a while)...")
    # Removed explicit device=0 because PyTorch is currently CPU-only.
    results = model.train(
        data=data_yaml_path, 
        epochs=15, 
        imgsz=640,
        batch=16,
        project=os.path.join(os.path.dirname(__file__), "runs"),
        name="license_plate_detector"
    )
    print("Training complete! Model saved to runs/license_plate_detector/weights/best.pt")

if __name__ == "__main__":
    yaml_path = prepare_dataset()
    train_model(yaml_path)
