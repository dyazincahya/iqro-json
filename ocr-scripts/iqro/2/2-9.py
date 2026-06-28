import easyocr
import json
import os
import re
import sys
from PIL import Image

# Transliteration dictionary for Hijaiyah base letters and vowels
consonants = {
    'ا': 'A', 'أ': 'A', 'إ': 'A', 'آ': 'A', 'ء': 'A',
    'ب': 'B', 'ت': 'T', 'ث': 'TS', 'ج': 'J', 'ح': 'H', 'خ': 'KH',
    'د': 'D', 'ذ': 'DZ', 'ر': 'R', 'ز': 'Z', 'س': 'S', 'ش': 'SY',
    'ص': 'SH', 'ض': 'DH', 'ط': 'TH', 'ظ': 'ZH', 'ع': "'", 'غ': 'GH',
    'ف': 'F', 'ق': 'Q', 'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N',
    'و': 'W', 'ه': 'H', 'ي': 'Y', 'ة': 'T', 'ى': 'A'
}

# Specific level vowel combinations
vowels_map = {
    # Fathah
    'اَ': 'A', 'أَ': 'A', 'إَ': 'A', 'آَ': 'A', 'ءَ': 'A',
    'بَ': 'BA', 'تَ': 'TA', 'ثَ': 'TSA', 'جَ': 'JA', 'حَ': 'HA', 'خَ': 'KHO',
    'دَ': 'DA', 'ذَ': 'DZA', 'رَ': 'RO', 'زَ': 'ZA', 'سَ': 'SA', 'شَ': 'SYA',
    'صَ': 'SHO', 'ضَ': 'DHO', 'طَ': 'THO', 'ظَ': 'ZHO', 'عَ': "'A", 'غَ': 'GHO',
    'فَ': 'FA', 'قَ': 'QO', 'كَ': 'KA', 'لَ': 'LA', 'مَ': 'MA', 'نَ': 'NA',
    'وَ': 'WA', 'هَ': 'HA', 'يَ': 'YA', 'ةَ': 'TA',
    # Kasrah
    'اِ': 'I', 'بِ': 'BI', 'تِ': 'TI', 'ثِ': 'TSI', 'جِ': 'JI', 'حِ': 'HI', 'خِ': 'KHI',
    'دِ': 'DI', 'ذِ': 'DZI', 'رِ': 'RI', 'زِ': 'ZI', 'سِ': 'SI', 'شِ': 'SYI',
    'صِ': 'SHI', 'ضِ': 'DHI', 'طِ': 'THI', 'ظِ': 'ZHI', 'عِ': "'I", 'غِ': 'GHI',
    'فِ': 'FI', 'قِ': 'QI', 'كِ': 'KI', 'لِ': 'LI', 'مِ': 'MI', 'نِ': 'NI',
    'وِ': 'WI', 'هِ': 'HI', 'يِ': 'YI',
    # Dhammah
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
    text = re.sub(r'\s+', ' ', text)
    return text

def add_fatha_if_missing(text):
    # Only for Level 1
    if 2 != 1:
        return text
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
            
        word_latin = []
        i = 0
        n = len(p)
        while i < n:
            char = p[i]
            # Check two character combination (letter + vowel)
            if i + 1 < n and p[i+1] in ['\u064E', '\u0650', '\u064F', '\u0652']: # fathah, kasrah, dhammah, sukun
                combo = char + p[i+1]
                vowel = p[i+1]
                if vowel == '\u0652': # Sukun (silent/consonant)
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
            # Join characters. For simple output, capitalize all
            latins.append("".join(word_latin).upper())
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
    image_path = os.path.join(base_dir, "iqro-images", "2", "2-9.png")
    output_dir = os.path.join(base_dir, "iqro", "2")
    output_path = os.path.join(output_dir, "2-9.json")
    
    print(f"Reading image: {image_path}")
    reader = easyocr.Reader(['ar', 'en'], gpu=False)
    
    temp_image = "temp_2-9.png"
    with Image.open(image_path) as img:
        new_size = (img.width * 2, img.height * 2)
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        img.save(temp_image)
        img_height = img.height

    results = reader.readtext(temp_image, detail=1, contrast_ths=0.1, adjust_contrast=0.7, 
                              low_text=0.3, link_threshold=0.3)
    
    if os.path.exists(temp_image):
        try: os.remove(temp_image)
        except: pass

    # Row grouping & sorting (RTL)
    results.sort(key=lambda x: x[0][0][1])
    rows = []
    if results:
        current_row_items = [results[0]]
        for i in range(1, len(results)):
            diff_y = abs(results[i][0][0][1] - current_row_items[-1][0][0][1])
            if diff_y < 80: 
                current_row_items.append(results[i])
            else:
                current_row_items.sort(key=lambda x: -x[0][0][0])
                rows.append(current_row_items)
                current_row_items = [results[i]]
        current_row_items.sort(key=lambda x: -x[0][0][0])
        rows.append(current_row_items)

    iqro_data = {
        "level_id": 2,
        "level_title": "IQRO' 2",
        "topic": {"latin": "Letters with Sukun and Extended Vowels (Mad)", "arab": "حُرُوفُ السُّكُونِ وَالْمَدِّ"},
        "instruction_id": "Berlatih menghubungkan huruf dengan sukun dan mengenali vokal yang diperpanjang.",
        "instruction_en": "Practice connecting letters with sukun and recognizing extended vowels.",
        "instruction_ar": "تَدَرَّبْ عَلَى وَصْلِ الْحُرُوفِ بِالسُّكُونِ وَتَعَرُّفِ الْمَدِّ.",
        "content": []
    }

    # Reference data for spelling alignment & layout correction
    reference_content = []

    # If reference exists, use standard layout sequence aligned with OCR row counts
    if reference_content:
        order_id = 1
        items_count = len(reference_content)
        current_idx = 0
        
        col_layout = []
        temp_count = items_count
        while temp_count > 0:
            if temp_count == 3:
                col_layout.append(3)
                temp_count -= 3
            elif temp_count >= 2:
                col_layout.append(2)
                temp_count -= 2
            else:
                col_layout.append(1)
                temp_count -= 1
                
        row_idx = 1
        for cols in col_layout:
            for col_idx in range(1, cols + 1):
                if current_idx < items_count:
                    ref_item = reference_content[current_idx]
                    arabic = ref_item.get("arabic", ref_item.get("arab", ""))
                    latin = ref_item.get("latin", "")
                    if "bَ" in arabic and not latin:
                        latin = "A A BA"
                    elif not latin:
                        latin = get_latin(arabic)
                        
                    iqro_data["content"].append({
                        "order_id": order_id,
                        "position": {
                            "row": row_idx,
                            "col": col_idx
                        },
                        "latin": latin,
                        "arabic": arabic
                    })
                    order_id += 1
                    current_idx += 1
            row_idx += 1
    else:
        # Fully dynamic OCR parsing if no reference content is available
        order_id = 1
        content_rows = [r for r in rows if (sum(item[0][0][1] for item in r) / len(r)) > (img_height * 0.25)]
        for r_idx, r in enumerate(content_rows):
            for c_idx, item in enumerate(r):
                raw_text = item[1].strip()
                arabic = clean_text(raw_text)
                arabic = add_fatha_if_missing(arabic)
                if not arabic:
                    continue
                latin = get_latin(arabic)
                iqro_data["content"].append({
                    "order_id": order_id,
                    "position": {
                        "row": r_idx + 1,
                        "col": c_idx + 1
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
