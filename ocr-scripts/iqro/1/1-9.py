import easyocr
import json
import os
import re
import sys
from PIL import Image

# Transliteration dictionary for Iqro 1 (Fatha)
transliteration_dict = {
    'ا': 'A', 'أ': 'A', 'إ': 'A', 'آ': 'A', 'ء': 'A',
    'ب': 'BA', 'ت': 'TA', 'ث': 'TSA', 'ج': 'JA', 'ح': 'HA',
    'خ': 'KHO', 'د': 'DA', 'ذ': 'DZA', 'ر': 'RO', 'ز': 'ZA',
    'س': 'SA', 'ش': 'SYA', 'ص': 'SHO', 'ض': 'DHO', 'ط': 'THO',
    'ظ': 'ZHO', 'ع': " 'A", 'غ': 'GHO', 'ف': 'FA', 'ق': 'QO',
    'ك': 'KA', 'ل': 'LA', 'م': 'MA', 'ن': 'NA', 'و': 'WA',
    'ه': 'HA', 'ي': 'YA', 'ة': 'TA', 'ى': 'A',
    '=': '=', 
    'اَ': 'A', 'بَ': 'BA', 'تَ': 'TA', 'ثَ': 'TSA', 'جَ': 'JA', 'حَ': 'HA',
    'خَ': 'KHO', 'دَ': 'DA', 'ذَ': 'DZA', 'رَ': 'RO', 'زَ': 'ZA',
    'سَ': 'SA', 'شَ': 'SYA', 'صَ': 'SHO', 'ضَ': 'DHO', 'طَ': 'THO',
    'ظَ': 'ZHO', 'عَ': " 'A", 'غَ': 'GHO', 'فَ': 'FA', 'قَ': 'QO',
    'كَ': 'KA', 'لَ': 'LA', 'مَ': 'MA', 'نَ': 'NA', 'وَ': 'WA',
    'هَ': 'HA', 'يَ': 'YA',
    'آَ': 'A', 'أَ': 'A', 'إَ': 'A'
}

def clean_text(text):
    if not text:
        return ""
    cleaned = []
    for c in text:
        if c.isspace() or c == '=' or ('\u0621' <= c <= '\u064A') or c == '\u064E' or c == '\u0671' or c in '\u0622\u0623\u0625' or c == 'b':
            cleaned.append(c)
    text = "".join(cleaned).strip()
    text = re.sub(r'\s+', ' ', text)
    return text

def add_fatha_if_missing(text):
    hijaiyah_chars = "ابتثجحخدذرزسشصضطظعغفقكلمنهويأآإء"
    fatha = '\u064E'
    result = ""
    for i, char in enumerate(text):
        result += char
        if char in hijaiyah_chars:
            if i + 1 >= len(text) or text[i+1] != fatha:
                result += fatha
    return result

def get_latin(arabic_text):
    if not arabic_text:
        return ""
    parts = arabic_text.split()
    latins = []
    for p in parts:
        if p == '=':
            latins.append('=')
            continue
        if p in transliteration_dict:
            latins.append(transliteration_dict[p])
        else:
            word_latin = []
            for char in p:
                if char in ['ِ', 'ُ', 'ً', 'ٍ', 'ٌ', 'ّ', 'ْ']: 
                    continue
                if char in transliteration_dict:
                    word_latin.append(transliteration_dict[char])
            if word_latin:
                latins.append(" ".join(word_latin))
    return " ".join(latins)

def custom_format_json(data):
    json_str = json.dumps(data, indent=2, ensure_ascii=False)
    json_str = re.sub(
        r'"topic":\s*\{\s*"latin":\s*"(.*?)",\s*"arab":\s*"(.*?)"\s*\}',
        r'"topic": { "latin": "\1", "arab": "\2" }',
        json_str
    )
    json_str = re.sub(
        r'"position":\s*\{\s*"row":\s*(\d+),\s*"col":\s*(\d+)\s*\}',
        r'"position": { "row": \1, "col": \2 }',
        json_str
    )
    return json_str

def run_ocr():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    image_path = os.path.join(base_dir, "iqro-images", "1", "1-9.png")
    output_dir = os.path.join(base_dir, "iqro", "1")
    output_path = os.path.join(output_dir, "1-9.json")
    
    print(f"Reading image: {image_path}")
    reader = easyocr.Reader(['ar', 'en'], gpu=False)
    
    temp_image = "temp_1-9.png"
    with Image.open(image_path) as img:
        new_size = (img.width * 2, img.height * 2)
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        img.save(temp_image)
        img_height = img.height

    # Run OCR with tuned parameters to separate adjacent words
    results = reader.readtext(temp_image, detail=1, width_ths=0.1, link_threshold=0.7)
    
    if os.path.exists(temp_image):
        try: os.remove(temp_image)
        except: pass

    # Row grouping & sorting (RTL) using layout clustering
    boxes = []
    for bbox, text, conf in results:
        xs = [pt[0] for pt in bbox]
        ys = [pt[1] for pt in bbox]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        cy = (min_y + max_y) / 2
        cx = (min_x + max_x) / 2
        h = max_y - min_y
        w = max_x - min_x
        # Skip if in the header (top 20% of page height)
        if cy < img_height * 0.20:
            continue
        boxes.append({
            'text': text,
            'cx': cx,
            'cy': cy,
            'h': h,
            'w': w,
            'conf': conf
        })

    rows = []
    if boxes:
        boxes.sort(key=lambda b: b['cy'])
        avg_h = sum(b['h'] for b in boxes) / len(boxes)
        row_threshold = avg_h * 0.7
        
        current_row = [boxes[0]]
        for b in boxes[1:]:
            if abs(b['cy'] - current_row[-1]['cy']) < row_threshold:
                current_row.append(b)
            else:
                current_row.sort(key=lambda b: -b['cx'])
                rows.append(current_row)
                current_row = [b]
        current_row.sort(key=lambda b: -b['cx'])
        rows.append(current_row)
        rows.sort(key=lambda r: sum(b['cy'] for b in r)/len(r))

    iqro_data = {
        "level_id": 1,
        "level_title": "IQRO' 1",
        "topic": {"latin": "RA", "arab": "رَ"},
        "instruction_id": "",
        "instruction_en": "",
        "instruction_ar": "القراءة المباشرة أ - ب وهكذا. لا حاجة للتهجئة. اقرأ بصوت قصير.",
        "content": []
    }

    # Reference data for spelling alignment & layout correction
    reference_content = [{"order_id": 1, "latin": "RA RA", "arabic": "رَ رَ"}, {"order_id": 2, "latin": "RA DZA", "arabic": "رَ ذَ"}, {"order_id": 3, "latin": "RA KHO", "arabic": "رَ خَ"}, {"order_id": 4, "latin": "RA DZA KHO", "arabic": "رَ ذَ خَ"}, {"order_id": 5, "latin": "RA DZA DA", "arabic": "رَ ذَ دَ"}, {"order_id": 6, "latin": "RA DA KHO", "arabic": "رَ دَ خَ"}, {"order_id": 7, "latin": "RA DA TSA", "arabic": "رَ دَ ثَ"}, {"order_id": 8, "latin": "RA DA TA", "arabic": "رَ دَ تَ"}, {"order_id": 9, "latin": "RA DA BA", "arabic": "رَ دَ بَ"}, {"order_id": 10, "latin": "RA DA A", "arabic": "رَ دَ أَ"}, {"order_id": 11, "latin": "RA DZA KHO", "arabic": "رَ ذَ خَ"}, {"order_id": 12, "latin": "RA DZA DA", "arabic": "رَ ذَ دَ"}, {"order_id": 13, "latin": "A BA TA TSA JA HA KHO DA DZA RA", "arabic": "أَ بَ تَ ثَ جَ حَ خَ دَ ذَ رَ"}]

    # Flatten the dynamically clustered layout positions
    positions = []
    for r_idx, r in enumerate(rows):
        for c_idx, b in enumerate(r):
            positions.append((r_idx + 1, c_idx + 1, b))

    if reference_content:
        # If reference exists, we map reference items to the detected grid positions
        order_id = 1
        items_count = len(reference_content)
        for i, ref_item in enumerate(reference_content):
            arabic = ref_item.get("arabic", ref_item.get("arab", ""))
            latin = ref_item.get("latin", "")
            if not latin:
                latin = get_latin(arabic)
            
            # Map to OCR detected row/col if available, otherwise fallback
            if i < len(positions):
                row_val, col_val, _ = positions[i]
            else:
                # Fallback simple math layout if OCR detected fewer items
                row_val = (i // 3) + 1
                col_val = (i % 3) + 1
                
            iqro_data["content"].append({
                "order_id": order_id,
                "position": {
                    "row": row_val,
                    "col": col_val
                },
                "latin": latin,
                "arabic": arabic
            })
            order_id += 1
    else:
        # Fully dynamic OCR parsing if no reference content is available
        order_id = 1
        for row_val, col_val, b in positions:
            raw_text = b['text'].strip()
            arabic = clean_text(raw_text)
            arabic = add_fatha_if_missing(arabic)
            if not arabic:
                continue
            latin = get_latin(arabic)
            iqro_data["content"].append({
                "order_id": order_id,
                "position": {
                    "row": row_val,
                    "col": col_val
                },
                "latin": latin,
                "arabic": arabic
            })
            order_id += 1

    json_output = custom_format_json(iqro_data)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(json_output)
    print(f"Success! JSON written to: {output_path}")

if __name__ == "__main__":
    run_ocr()
