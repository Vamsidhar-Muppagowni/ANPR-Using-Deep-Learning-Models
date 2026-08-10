import os, time, cv2
from backend.ml.pipeline import ANPRPipeline

test_dir = r'C:\Users\vamsi\Downloads\Test'
if not os.path.exists(test_dir):
    print(f'Directory {test_dir} not found!')
else:
    print(f'Scanning {test_dir}...')
    try:
        p = ANPRPipeline()
        for filename in os.listdir(test_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                img_path = os.path.join(test_dir, filename)
                img = cv2.imread(img_path)
                if img is not None:
                    print(f'\n--- {filename} ---')
                    t0 = time.time()
                    plate, ann, metrics = p.process_image(img)
                    t1 = time.time()
                    print(f'Plate: {plate}')
                    print(f'State: {metrics.get("state", "Unknown")}')
                    print(f'Time: {(t1-t0)*1000:.0f} ms')
    except Exception as e:
        import traceback
        traceback.print_exc()
