import cv2, itertools, time
import numpy as np

def rewrite_pipeline():
    with open('backend/ml/pipeline.py', 'r') as f:
        lines = f.readlines()
        
    before_process_image = lines[:31]
    
    new_process_image = """    def process_image(self, image):
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
                max_dim = 1280
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
                images_to_test = [resized_img, gray_clahe]
            else:
                images_to_test = [resized_img, gray_clahe, sharpened, thresh, bolt_removed]
            
            raw_texts = []
            ocr_probs = []
            
            # LAZY EVALUATION: Check variations one by one
            best_plate_number = ""
            best_score = -1
            
            for img_variant in images_to_test:
                results = self.reader.readtext(img_variant, detail=1, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
                
                # Extract text
                for (bbox, text, prob) in results:
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
                for pair in itertools.permutations(raw_texts, 2):
                    candidates.append("".join(pair))
                for triplet in itertools.permutations(raw_texts, 3):
                    candidates.append("".join(triplet))
                    
                # Score Candidates
                for cand in candidates:
                    if 7 <= len(cand) <= 10:
                        score = 0
                        valid_states_set = {"AN", "AP", "AR", "AS", "BR", "CH", "CG", "DD", "DN", "DL", "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "LA", "LD", "MP", "MH", "MN", "ML", "MZ", "NL", "OD", "PY", "PB", "RJ", "SK", "TN", "TS", "TG", "TR", "UP", "UK", "WB"}
                        if cand[0:2] in valid_states_set: score += 3
                        elif cand[0].isalpha() or cand[1].isalpha(): score += 1
                        
                        if len(cand) >= 4:
                            rto = cand[2:4]
                            if rto.isdigit():
                                score += 3
                            elif cand[0:2] == 'DL' and rto[0].isdigit() and rto[1].isalpha():
                                score += 3
                            elif rto[0].isdigit() or rto[1].isdigit():
                                score += 1
                        
                        if cand[-4:].isdigit(): score += 4
                        else:
                            score += sum(c.isdigit() for c in cand[-4:])
                            
                        if len(cand) == 9 or len(cand) == 10:
                            score += 1
                            
                        if score > best_score:
                            best_score = score
                            best_plate_number = cand
                            
                # Apply OCR corrections
                if best_score >= 6 and best_plate_number:
                    char_to_num = {'O': '0', 'I': '1', 'Z': '2', 'B': '8', 'S': '5', 'G': '6', 'A': '4', 'L': '4', 'T': '7', 'Q': '0', 'D': '0'}
                    num_to_char = {'0': 'O', '1': 'I', '2': 'Z', '8': 'B', '5': 'S', '6': 'G', '4': 'A'}
                    
                    res = list(best_plate_number)
                    for i in range(min(2, len(res))):
                        if res[i] in num_to_char: res[i] = num_to_char[res[i]]
                    for i in range(2, min(4, len(res))):
                        if i == 3 and res[0:2] == ['D', 'L']:
                            continue
                        if res[i] in char_to_num: res[i] = char_to_num[res[i]]
                    for i in range(max(4, len(res)-4), len(res)):
                        if res[i] in char_to_num: res[i] = char_to_num[res[i]]
                        
                    best_plate_number = "".join(res)
                    
                    # State code correction
                    valid_states = {"AN", "AP", "AR", "AS", "BR", "CH", "CG", "DD", "DN", "DL", "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "LA", "LD", "MP", "MH", "MN", "ML", "MZ", "NL", "OD", "PY", "PB", "RJ", "SK", "TN", "TS", "TG", "TR", "UP", "UK", "WB"}
                    state_code = best_plate_number[0:2]
                    if len(state_code) == 2 and state_code not in valid_states:
                        replacements = {'I': 'T', 'M': 'N', 'O': 'D', '0': 'D', '8': 'B', 'U': 'V', 'C': 'G'}
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
                                        
                # If we found a great plate (score >= 10) in this variation, don't run more image variations!
                if best_score >= 10:
                    break

            # --- UPDATE GLOBAL BEST ---
            if best_score > global_best_score:
                global_best_score = best_score
                global_best_plate = best_plate_number
                global_best_ann = annotated_img
                global_best_metrics = metrics_copy
                
            # If we found a great plate across boxes, stop processing more YOLO boxes (and skip fallback)
            if global_best_score >= 10:
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
            
            if metrics["state"] == "Unknown":
                best_plate_number = ""
                metrics["state_code"] = "XX"
            
        metrics["processing_time_ms"] = int((time.time() - start_time) * 1000)
            
        return best_plate_number, annotated_img, metrics
"""

    with open('backend/ml/pipeline.py', 'w') as f:
        f.writelines(before_process_image)
        f.write(new_process_image)

rewrite_pipeline()
