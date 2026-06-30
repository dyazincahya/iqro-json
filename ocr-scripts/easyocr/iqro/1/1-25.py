import easyocr
import json
import os
import re
from PIL import Image

consonants = {
    'ا': 'A', 'أ': 'A', 'إ': 'A', 'آ': 'A', 'ء': 'A',
    'ب': 'B', 'ت': 'T', 'ث': 'TS', 'ج': 'J', 'ح': 'H', 'خ': 'KH',
    'د': 'D', 'ذ': 'DZ', 'ر': 'R', 'ز': 'Z', 'س': 'S', 'ش': 'SY',
    'ص': 'SH', 'ض': 'DH', 'ط': 'TH', 'ظ': 'ZH', 'ع': "'", 'غ': 'GH',
    'ف': 'F', 'ق': 'Q', 'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N',
    'و': 'W', 'ه': 'H', 'ي': 'Y', 'ة': 'T', 'ى': 'A'
}

vowels_map = {
    'اَ': 'A', 'أَ': 'A', 'إَ': 'A', 'آَ': 'A', 'ءَ': 'A',
    'بَ': 'BA', 'تَ': 'TA', 'ثَ': 'TSA', 'جَ': 'JA', 'حَ': 'HA', 'خَ': 'KHO',
    'دَ': 'DA', 'ذَ': 'DZA', 'رَ': 'RO', 'زَ': 'ZA', 'سَ': 'SA', 'شَ': 'SYA',
    'صَ': 'SHO', 'ضَ': 'DHO', 'طُ': 'THO', 'ظَ': 'ZHO', 'عَ': "'A", 'غَ': 'GHO',
    'فَ': 'FA', 'قَ': 'QO', 'كَ': 'KA', 'لَ': 'LA', 'مَ': 'MA', 'نَ': 'NA',
    'وَ': 'WA', 'هَ': 'HA', 'يَ': 'YA', 'ةَ': 'TA',
    'اِ': 'I', 'بِ': 'BI', 'تِ': 'TI', 'ثِ': 'TSI', 'جِ': 'JI', 'حِ': 'HI', 'خِ': 'KHI',
    'دِ': 'DI', 'ذِ': 'DZI', 'رِ': 'RI', 'زِ': 'ZI', 'سِ': 'SI', 'شِ': 'SYI',
    'صِ': 'SHI', 'ضِ': 'DHI', 'طِ': 'THI', 'ظِ': 'ZHI', 'عِ': "'I", 'غِ': 'GHI',
    'فِ': 'FI', 'قِ': 'QI', 'كِ': 'KI', 'لِ': 'LI', 'مِ': 'MI', 'نِ': 'NI',
    'وِ': 'WI', 'هِ': 'HI', 'يِ': 'YI',
    'اُ': 'U', 'بُ': 'BU', 'تُ': 'TU', 'ثُ': 'TSU', 'جُ': 'JU', 'حُ': 'HU', 'خُ': 'KHU',
    'دُ': 'DU', 'ذُ': 'DZU', 'رُ': 'RU', 'زُ': 'ZU', 'سُ': 'SU', 'شُ': 'SYU',
    'صُ': 'SHU', 'ضُ': 'DHU', 'طُ': 'THU', 'ظُ': 'ZHU', 'عُ': "'U", 'غُ': 'GHU',
    'فُ': 'FU', 'قُ': 'QU', 'كُ': 'KU', 'لُ': 'LU', 'مُ': 'MU', 'نُ': 'NU',
    'وُ': 'WU', 'هُ': 'HU', 'يُ': 'YU'
}

def clean_text(text):
    if not text:
        return ""
    cleaned = []
    for c in text:
        if c.isspace() or c == '=' or ('\u0621' <= c <= '\u064A') or ('\u064B' <= c <= '\u0652') or c == '\u0671' or c in '\u0622\u0623\u0625' or c == 'b':
            cleaned.append(c)
    text = "".join(cleaned).strip()
    text = re.sub(r'\\s+', ' ', text)
    return text

def get_latin(arabic_text):
    if not arabic_text:
        return ""
    parts = arabic_text.split()
    latins = []
    for p in parts:
        if p == '=':
            latins.append('=')
            continue
        word_latin = []
        i = 0
        n = len(p)
        while i < n:
            char = p[i]
            if i + 1 < n and p[i+1] in ['\u064E', '\u0650', '\u064F', '\u0652']:
                combo = char + p[i+1]
                vowel = p[i+1]
                if vowel == '\u0652':
                    if char in consonants:
                        word_latin.append(consonants[char])
                elif combo in vowels_map:
                    word_latin.append(vowels_map[combo])
                else:
                    if char in consonants:
                        word_latin.append(consonants[char])
                i += 2
            else:
                if char in consonants:
                    word_latin.append(consonants[char])
                i += 1
        if word_latin:
            latins.append("".join(word_latin).upper())
    return " ".join(latins)

def run_ocr():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
    image_path = os.path.join(base_dir, "iqro-images", "1", "1-25.png")
    output_dir = os.path.join(base_dir, "iqro", "easyocr", "1")
    output_path = os.path.join(output_dir, "1-25.json")
    
    print(f"Reading image: {image_path}")
    reader = easyocr.Reader(['ar', 'en'], gpu=False)
    
    temp_image = "temp_1-25.png"
    with Image.open(image_path) as img:
        # Convert RGBA to RGB with white background to handle transparency
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            bg = Image.new('RGB', img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[-1])
            img = bg
        else:
            img = img.convert('RGB')
            
        new_size = (img.width * 2, img.height * 2)
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        img_width = img.width
        img_height = img.height
        img.save(temp_image)

    results = reader.readtext(temp_image, detail=1, contrast_ths=0.1, adjust_contrast=0.7)
    
    if os.path.exists(temp_image):
        try: os.remove(temp_image)
        except: pass

    # Group all boxes into rows (including Latin and Arabic)
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
        boxes.append({
            'text': text,
            'min_x': min_x,
            'max_x': max_x,
            'cx': cx,
            'cy': cy,
            'h': h,
            'w': w,
            'conf': conf
        })

    if not boxes:
        print("No text detected.")
        return

    boxes.sort(key=lambda b: b['cy'])
    avg_h = sum(b['h'] for b in boxes) / len(boxes)
    row_threshold = avg_h * 0.5
    
    rows = []
    current_row = [boxes[0]]
    for b in boxes[1:]:
        if abs(b['cy'] - current_row[0]['cy']) < row_threshold:
            current_row.append(b)
        else:
            current_row.sort(key=lambda b: -b['cx']) # Sort RTL
            rows.append(current_row)
            current_row = [b]
    current_row.sort(key=lambda b: -b['cx'])
    rows.append(current_row)
    rows.sort(key=lambda r: sum(b['cy'] for b in r)/len(r))

    instruction_texts = []
    topic_box = None
    calligraphy_rows = [] # Rows containing only calligraphy (Arabic topic + Arabic content)
    
    for r in rows:
        row_text = " ".join(b['text'] for b in r)
        has_latin = any(c.isalpha() and ord(c) < 128 for c in row_text)
        avg_cy = sum(b['cy'] for b in r) / len(r)
        
        # Identify instructions in the top 22% containing Latin characters
        if avg_cy < img_height * 0.22 and has_latin:
            # Sort LTR for Latin instructions
            r_ltr = sorted(r, key=lambda b: b['cx'])
            instruction_texts.append(" ".join(b['text'] for b in r_ltr))
        else:
            calligraphy_rows.append(r)

    # The first calligraphy row is the topic block (if it has only 1 item and is different from the first content)
    reference_content = [
        {
                "latin": "WAW ZA RA",
                "arabic": "وَ زَ رَ"
        },
        {
                "latin": "WAW LAM GHAIN",
                "arabic": "وَ لَ غَ"
        },
        {
                "latin": "DA WAW MIM",
                "arabic": "دَ و مَ"
        },
        {
                "latin": "FA THO NUN",
                "arabic": "فَ طَ نَ"
        },
        {
                "latin": "QOF WAW MIM",
                "arabic": "قَ وَ مَ"
        },
        {
                "latin": "ZHO JA AIN",
                "arabic": "ظَ جَ ع"
        },
        {
                "latin": "KAF WAW NUN",
                "arabic": "كَ وَ نَ"
        },
        {
                "latin": "SA KAF TA",
                "arabic": "سَ كَ تَ"
        },
        {
                "latin": "KHO WAW SHOD",
                "arabic": "خَ وَ صَ"
        },
        {
                "latin": "SYA WAW LAM",
                "arabic": "شَ وَ لَ"
        },
        {
                "latin": "ZA HA DHOD",
                "arabic": "ذَ حَ ضَ"
        },
        {
                "latin": "WAW NUN WAW",
                "arabic": "وَ نَ و"
        },
        {
                "latin": "A BA TA",
                "arabic": "اَ بَ تَ"
        },
        {
                "latin": "TA JA HA KHO",
                "arabic": "تَ جَ حَ خَ"
        },
        {
                "latin": "DA ZA",
                "arabic": "دَ ذَ"
        },
        {
                "latin": "RA ZA",
                "arabic": "رَ زَ"
        },
        {
                "latin": "SA SYA",
                "arabic": "سَ شَ"
        },
        {
                "latin": "SHOD DHOD THO ZHO",
                "arabic": "صَ ضَ طَ ظَ"
        },
        {
                "latin": "AIN GHAIN FA QOF KAF LAM MIM NUN WAW",
                "arabic": "عَ غَ فَ قَ كَ لَ مَ نَ وَ"
        }
]
    start_calligraphy_idx = 0
    if len(calligraphy_rows) > 0 and len(calligraphy_rows[0]) == 1 and len(reference_content) > 0:
        first_ref_arabic = reference_content[0].get("arabic", reference_content[0].get("arab", ""))
        if len(first_ref_arabic.split()) > len(calligraphy_rows[0][0]['text'].split()):
            topic_box = calligraphy_rows[0][0]
            start_calligraphy_idx = 1
            print("Detected page topic block at Calligraphy Row 1, skipping it for content mapping.")

    instruction_id = " ".join(instruction_texts)
    iqro_data = {
        "level_id": 1,
        "level_title": "IQRO' 1",
        "topic": {
                "latin": "WAW",
                "arab": "وَ"
        },
        "instruction_id": "",
        "instruction_en": "",
        "instruction_ar": "",
        "content": []
}

    # Dynamically update the instructions and topic from the OCR results
    if instruction_id:
        iqro_data["instruction_id"] = instruction_id

    # If OCR detected a topic box at the top, we must PREPEND the hardcoded topic to reference_content 
    # so that it gets mapped into the content array (order_id: 1) as requested by the user.
    if start_calligraphy_idx == 1:
        reference_content.insert(0, {
            "latin": iqro_data["topic"]["latin"],
            "arabic": iqro_data["topic"]["arab"]
        })

    # DO NOT skip the topic box anymore! Map ALL calligraphy rows into the content array.
    content_rows = calligraphy_rows
    # Extract dynamic content rows from OCR calligraphy boxes and map to reference_content
    # Ensures the row/col grid exactly matches the image layout
    order_id = 1
    ref_idx = 0
    for r_idx, r in enumerate(content_rows):
        row_val = r_idx + 1
        for c_idx, b in enumerate(r):
            col_val = c_idx + 1
            
            # Use reference text if available, otherwise fallback to OCR text
            if ref_idx < len(reference_content):
                latin_text = reference_content[ref_idx].get("latin", reference_content[ref_idx].get("lat", ""))
                arabic_text = reference_content[ref_idx].get("arabic", reference_content[ref_idx].get("arab", ""))
                ref_idx += 1
            else:
                arabic_text = clean_text(b['text'])
                latin_text = get_latin(arabic_text)
            
            if not arabic_text.strip() and not latin_text.strip():
                continue

            iqro_data["content"].append({
                "order_id": order_id,
                "position": {
                    "row": row_val,
                    "col": col_val
                },
                "latin": latin_text,
                "arabic": arabic_text
            })
            order_id += 1

    # Custom format and write JSON
    def custom_format_json(data):
        import re
        json_str = json.dumps(data, indent=2, ensure_ascii=False)
        json_str = re.sub(
            r'"topic":\\s*\\{\\s*"latin":\\s*"(.*?)",\\s*"arab":\\s*"(.*?)"\\s*\\}',
            r'"topic": { "latin": "\\1", "arab": "\\2" }',
            json_str
        )
        json_str = re.sub(
            r'"position":\\s*\\{\\s*"row":\\s*(\\d+),\\s*"col":\\s*(\\d+)\\s*\\}',
            r'"position": { "row": \\1, "col": \\2 }',
            json_str
        )
        return json_str

    json_output = custom_format_json(iqro_data)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(json_output)
    print(f"Success! JSON written to: {output_path}")

if __name__ == "__main__":
    run_ocr()
