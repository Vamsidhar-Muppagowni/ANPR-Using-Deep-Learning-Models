import time
import itertools
import os
import cv2
import numpy as np
import easyocr
import re
from ultralytics import YOLO
class ANPRPipeline:
    def __init__(self, cascade_path=None):
        print("Initializing EasyOCR (this may take a moment to download weights on first run)...")
        self.reader = easyocr.Reader(['en'])
        
        # Load the custom trained YOLO model
        yolo_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'runs', 'license_plate_detector', 'weights', 'best.pt')
        if os.path.exists(yolo_path):
            print("Initializing YOLO License Plate Detector...")
            self.yolo_model = YOLO(yolo_path)
            self.use_yolo = True
        else:
            print("YOLO weights not found. Falling back to Haar Cascades.")
            self.use_yolo = False
            
        # Initialize Super Resolution AI
        sr_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "FSRCNN_x4.pb")
        self.sr = None
        if hasattr(cv2, 'dnn_superres') and os.path.exists(sr_path):
            print("Initializing AI Super Resolution (FSRCNN)...")
            self.sr = cv2.dnn_superres.DnnSuperResImpl_create()
            self.sr.readModel(sr_path)
            self.sr.setModel("fsrcnn", 4)

    def process_image(self, image):
        start_time = time.time()
        
        annotated_img = image.copy()
        
        metrics = {
            "processing_time_ms": 0,
            "yolo_conf": 0.0,
            "ocr_conf": 0.0,
            "state": "Unknown",
            "state_code": "XX"
        }
        
        global_best_plate = ""
        global_best_score = -1
        global_best_ann = image.copy()
        global_best_metrics = metrics.copy()
        
        yolo_boxes_to_process = []
        if self.use_yolo and self.yolo_model is not None:
            results = self.yolo_model(image, verbose=False)[0]
            boxes = results.boxes.data.cpu().numpy()
            
            # If no plates are found, the plate might be "too far" (very small).
            # Run YOLO again at a much higher internal resolution and lower confidence.
            if len(boxes) == 0:
                # Lower confidence significantly for the fallback to catch difficult/small plates
                # Also increase imgsz to 1920 so tiny plates aren't lost in downscaling
                results = self.yolo_model(image, imgsz=1920, conf=0.05, verbose=False)[0]
                boxes = results.boxes.data.cpu().numpy()
                
            if len(boxes) > 0:
                yolo_boxes_to_process = list(boxes)
        
        # ALWAYS add None to the end of the list to act as a fallback.
        yolo_boxes_to_process.append(None)
            
        for box in yolo_boxes_to_process:
            annotated_img = image.copy()
            metrics_copy = metrics.copy()
            
            if box is not None:
                x1, y1, x2, y2, conf, cls = box
                metrics_copy["yolo_conf"] = float(conf)
                
                cv2.rectangle(annotated_img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                cv2.putText(annotated_img, "YOLO Plate", (int(x1), int(y1)-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
                
                pad = 10
                h_img, w_img = image.shape[:2]
                y1_p = max(0, int(y1) - pad)
                y2_p = min(h_img, int(y2) + pad)
                x1_p = max(0, int(x1) - pad)
                x2_p = min(w_img, int(x2) + pad)
                
                ocr_input = image[y1_p:y2_p, x1_p:x2_p]
                offset_x, offset_y = x1_p, y1_p
            else:
                ocr_input = image
                offset_x, offset_y = 0, 0
                
            height, width = ocr_input.shape[:2]
            
            # Upscale with AI Super Resolution if available and crop is very small
            if self.sr is not None and height > 0 and width > 0:
                if height < 64:
                    ocr_input = self.sr.upsample(ocr_input)
                    height, width = ocr_input.shape[:2]
                    
            scale = 1.0
            if box is not None:
                target_height = 64
                if height > 0 and width > 0:
                    scale = target_height / height
                    resized_img = cv2.resize(ocr_input, (int(width * scale), target_height), interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC)
                else:
                    resized_img = ocr_input
            else:
                max_dim = 2000 # Restored to 2000 because 1280 shrunk the text too much
                if max(height, width) > max_dim:
                    scale = max_dim / max(height, width)
                    resized_img = cv2.resize(ocr_input, (int(width * scale), int(height * scale)), interpolation=cv2.INTER_AREA)
                else:
                    resized_img = ocr_input
                
            gray = cv2.cvtColor(resized_img, cv2.COLOR_BGR2GRAY)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4,4))
            gray_clahe = clahe.apply(gray)
            
            gaussian = cv2.GaussianBlur(gray_clahe, (0, 0), 2.0)
            sharpened = cv2.addWeighted(gray_clahe, 1.5, gaussian, -0.5, 0)
            
            _, thresh = cv2.threshold(sharpened, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
            bolt_removed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            
            if box is None:
                # If we are falling back to the full image, ONLY run ONE variation to save time.
                # However, use `gray_clahe` instead of the raw image because painted text needs high contrast!
                images_to_test = [gray_clahe]
            else:
                images_to_test = [resized_img, gray_clahe, sharpened, thresh, bolt_removed]
            
            # LAZY EVALUATION: Check variations one by one
            best_plate_number = ""
            best_score = -1
            
            for img_variant in images_to_test:
                raw_texts = []
                raw_texts = []
                ocr_probs = []
                results_with_list = self.reader.readtext(img_variant, detail=1, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.- ')
                
                # Combine results
                all_results = results_with_list
                
                # Extract text
                for (bbox, text, prob) in all_results:
                    if img_variant is resized_img:
                        pt1 = (int(bbox[0][0] / scale) + offset_x, int(bbox[0][1] / scale) + offset_y)
                        pt2 = (int(bbox[2][0] / scale) + offset_x, int(bbox[2][1] / scale) + offset_y)
                        cv2.rectangle(annotated_img, pt1, pt2, (51, 51, 255), 2)
                    
                    clean = "".join(c for c in text if c.isalnum()).upper()
                    if clean and clean not in raw_texts:
                        raw_texts.append(clean)
                        ocr_probs.append(prob)
                
                if ocr_probs:
                    metrics_copy["ocr_conf"] = float(np.mean(ocr_probs))
                    
                # Generate Candidates
                candidates = []
                for text in raw_texts:
                    candidates.append(text)
                    
                # Limit permutations if there's too much text (e.g. ads on vehicles) to prevent 30s hangs
                if len(raw_texts) <= 6:
                    for pair in itertools.permutations(raw_texts, 2):
                        candidates.append("".join(pair))
                    for triplet in itertools.permutations(raw_texts, 3):
                        candidates.append("".join(triplet))
                    
                # Intelligent Spatial Join (Line-based)
                # Group words into horizontal lines to prevent joining random background text
                lines = []
                sorted_by_y = sorted(results_with_list, key=lambda r: min(pt[1] for pt in r[0]))
                
                current_line = []
                current_y = -1
                # Use 40 pixels as a generous line height tolerance for large painted plates
                tolerance = 40 
                
                for bbox, text, prob in sorted_by_y:
                    clean = "".join(c for c in text if c.isalnum()).upper()
                    if not clean: continue
                    
                    y = min(pt[1] for pt in bbox)
                    if current_y == -1 or abs(y - current_y) < tolerance:
                        current_line.append((bbox, clean))
                        if current_y == -1: current_y = y
                    else:
                        lines.append(current_line)
                        current_line = [(bbox, clean)]
                        current_y = y
                if current_line:
                    lines.append(current_line)
                    
                # Join words in each line
                line_strings = []
                for line in lines:
                    line_sorted = sorted(line, key=lambda item: min(pt[0] for pt in item[0]))
                    words = [item[1] for item in line_sorted]
                    full_line = "".join(words)
                    candidates.append(full_line)
                    line_strings.append(full_line)
                    
                    # Add sub-segments of the line in case of noise at the edges
                    for length in range(2, len(words)):
                        for i in range(len(words) - length + 1):
                            candidates.append("".join(words[i:i+length]))
                            
                # Join consecutive lines (for 2-line square plates)
                for i in range(len(line_strings) - 1):
                    candidates.append(line_strings[i] + line_strings[i+1])
                    
                # Score Candidates
                for cand in candidates:
                    print("Scoring:", cand)
                    if 7 <= len(cand) <= 10:
                        score = 0
                        valid_states_set = {"AN", "AP", "AR", "AS", "BR", "CH", "CG", "DD", "DN", "DL", "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "LA", "LD", "MP", "MH", "MN", "ML", "MZ", "NL", "OD", "PY", "PB", "RJ", "SK", "TN", "TS", "TG", "TR", "UP", "UK", "WB"}
                        
                        st_code = cand[0:2]
                        if st_code in valid_states_set: 
                            score += 3
                        else:
                            # Expanded common state code OCR errors (e.g. H -> W for WB)
                            repl = {'I':'T','T':'I','M':'N','H':'W','O':'D','0':'O','8':'B','U':'V','V':'U','C':'G','G':'C','X':'K','N':'M','1':'I','5':'S','4':'A','2':'Z','7':'T'}
                            temp = list(st_code)
                            for i in range(len(temp)):
                                if temp[i] in repl:
                                    temp[i] = repl[temp[i]]
                            if "".join(temp) in valid_states_set:
                                score += 3
                                
                        if len(cand) == 9 or len(cand) == 10:
                            score += 1
                            
                        actual_digits_count = sum(c.isdigit() for c in cand)
                        if actual_digits_count < 2:
                            score -= 5
                            
                        char_to_num = {'O': '0', 'I': '1', 'Z': '2', 'B': '8', 'S': '5', 'G': '6', 'A': '4', 'L': '4', 'T': '7', 'Q': '0', 'D': '0'}
                        
                        if len(cand) >= 4:
                            rto = cand[2:4]
                            rto_sim = "".join([char_to_num.get(c, c) for c in rto])
                            if rto.isdigit():
                                score += 3
                            elif rto_sim.isdigit():
                                score += 2
                            elif cand[0:2] == 'DL' and rto_sim[0].isdigit() and rto[1].isalpha():
                                score += 3
                            elif rto_sim[0].isdigit() or rto_sim[1].isdigit():
                                score += 1
                        
                        last4 = cand[-4:]
                        last4_sim = "".join([char_to_num.get(c, c) for c in last4])
                        if last4.isdigit():
                            score += 5
                        elif last4_sim.isdigit():
                            score += 4
                        else:
                            score += sum(c.isdigit() for c in last4_sim)
                            
                        # Add a tiny fraction of OCR confidence to break ties (e.g. 14.95 vs 14.82)
                        # This ensures we pick the variation (e.g. sharpened vs thresholded) that OCR was most confident in!
                        if ocr_probs:
                            score += float(np.mean(ocr_probs)) * 0.5
                            
                        if score > best_score:
                            best_score = score
                            best_plate_number = cand
                            print(f"New Best: {best_plate_number} (Score: {best_score})")
                            
                # Apply OCR corrections
                if best_score >= 6 and best_plate_number:
                    char_to_num = {'O': '0', 'I': '1', 'Z': '2', 'B': '8', 'S': '5', 'G': '6', 'A': '4', 'L': '4', 'T': '7', 'Q': '0', 'D': '0'}
                    num_to_char = {'0': 'Q', '1': 'I', '2': 'Z', '8': 'B', '5': 'S', '6': 'G', '4': 'A', '7': 'T'}
                    
                    res = list(best_plate_number)
                    
                    # Structural parsing: Indian plates usually end with 4 digits.
                    # State (2) + RTO (2) + Letters (1-3) + Numbers (4)
                    
                    # 1. State Code (First 2 must be letters)
                    for i in range(min(2, len(res))):
                        if res[i] in num_to_char: res[i] = num_to_char[res[i]]
                    
                    # 2. RTO Code (Next 2 are usually numbers, except DL special case)
                    for i in range(2, min(4, len(res))):
                        if i == 3 and res[0:2] == ['D', 'L']:
                            if res[i] in num_to_char: res[i] = num_to_char[res[i]]
                            continue
                        if res[i] in char_to_num: res[i] = char_to_num[res[i]]
                        
                    # 3. Middle letters section (Must be letters)
                    for i in range(4, max(4, len(res)-4)):
                        if res[i] in num_to_char: res[i] = num_to_char[res[i]]
                        # 'I' and 'O' are not legally issued in the middle letters of Indian plates
                        if res[i] == 'O': res[i] = 'Q'
                        if res[i] == 'I': res[i] = 'T' # or J/L, but usually OCR reads T or 1 as I
                        
                    # 4. Last 4 characters (Must be numbers)
                    for i in range(max(4, len(res)-4), len(res)):
                        if res[i] in char_to_num: res[i] = char_to_num[res[i]]
                        
                    # 4. Middle characters (Letters between RTO and Last 4)
                    if len(res) > 8:
                        for i in range(4, len(res)-4):
                            if res[i] in num_to_char: res[i] = num_to_char[res[i]]
                        
                    best_plate_number = "".join(res)
                    
                    # State code correction
                    valid_states = {"AN", "AP", "AR", "AS", "BR", "CH", "CG", "DD", "DN", "DL", "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "LA", "LD", "MP", "MH", "MN", "ML", "MZ", "NL", "OD", "PY", "PB", "RJ", "SK", "TN", "TS", "TG", "TR", "UP", "UK", "WB"}
                    state_code = best_plate_number[0:2]
                    if len(state_code) == 2 and state_code not in valid_states:
                        replacements = {'I':'T','T':'I','M':'N','N':'M','H':'W','O':'D','0':'O','8':'B','U':'V','V':'U','C':'G','G':'C','X':'K','1':'I','5':'S','4':'A','2':'Z','7':'T'}
                        temp = list(state_code)
                        for i in range(2):
                            if temp[i] in replacements:
                                temp[i] = replacements[temp[i]]
                        if "".join(temp) in valid_states:
                            best_plate_number = "".join(temp) + best_plate_number[2:]
                        else:
                            for i in range(2):
                                if state_code[i] in replacements:
                                    temp = list(state_code)
                                    temp[i] = replacements[temp[i]]
                                    if "".join(temp) in valid_states:
                                        best_plate_number = "".join(temp) + best_plate_number[2:]
                                        break
                                        
                # We removed the early break (score >= 11) here so that we evaluate ALL image variations
                # and pick the one with the highest OCR confidence tie-breaker!

            # --- UPDATE GLOBAL BEST ---
            if best_score > global_best_score:
                global_best_score = best_score
                global_best_plate = best_plate_number
                global_best_ann = annotated_img
                global_best_metrics = metrics_copy
                
            # If we found a PERFECT plate across boxes, stop processing more YOLO boxes (and skip fallback)
            if global_best_score >= 11:
                break
                
        # After processing all boxes, load the best results
        best_plate_number = global_best_plate
        annotated_img = global_best_ann
        metrics = global_best_metrics
                                
        state_map = {
            "AP": "Andhra Pradesh", "AR": "Arunachal Pradesh", "AS": "Assam", "BR": "Bihar",
            "CG": "Chhattisgarh", "GA": "Goa", "GJ": "Gujarat", "HR": "Haryana",
            "HP": "Himachal Pradesh", "JH": "Jharkhand", "KA": "Karnataka", "KL": "Kerala",
            "MP": "Madhya Pradesh", "MH": "Maharashtra", "MN": "Manipur", "ML": "Meghalaya",
            "MZ": "Mizoram", "NL": "Nagaland", "OD": "Odisha", "PB": "Punjab", "RJ": "Rajasthan",
            "SK": "Sikkim", "TN": "Tamil Nadu", "TG": "Telangana", "TR": "Tripura", "UP": "Uttar Pradesh",
            "UK": "Uttarakhand", "WB": "West Bengal", "AN": "Andaman & Nicobar", "CH": "Chandigarh",
            "DN": "Dadra & Nagar Haveli", "DD": "Daman & Diu", "DL": "Delhi", "JK": "Jammu & Kashmir",
            "LA": "Ladakh", "LD": "Lakshadweep", "PY": "Puducherry"
        }
        
        if best_plate_number and len(best_plate_number) >= 2:
            sc = best_plate_number[0:2]
            metrics["state_code"] = sc
            metrics["state"] = state_map.get(sc, "Unknown")
            
            # Do NOT wipe the plate number if the state is unknown! 
            # If the state code is physically obscured (like by a flower), we still want to return the rest of the numbers!
            if metrics["state"] == "Unknown":
                metrics["state_code"] = "XX"
            
        metrics["processing_time_ms"] = int((time.time() - start_time) * 1000)
            
        return best_plate_number, annotated_img, metrics
