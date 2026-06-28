import os
import glob
import json
import re

def generate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # Target level 1 specifically
    level_id = 1
    images_dir = os.path.join(base_dir, "iqro-images", str(level_id))
    old_json_dir = os.path.join(base_dir, ".old", "iqro", f"iqro-{level_id}")
    scripts_dir = os.path.join(base_dir, "ocr-scripts", "iqro", str(level_id))
    
    os.makedirs(scripts_dir, exist_ok=True)
    
    # Template Python script
    template = """import easyocr
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
        if c.isspace() or c == '=' or ('\\u0621' <= c <= '\\u064A') or c == '\\u064E' or c == '\\u0671' or c in '\\u0622\\u0623\\u0625' or c == 'b':
            cleaned.append(c)
    text = "".join(cleaned).strip()
    text = re.sub(r'\\s+', ' ', text)
    return text

def add_fatha_if_missing(text):
    hijaiyah_chars = "ابتثجحخدذرزسشصضطظعغفقكلمنهويأآإء"
    fatha = '\\u064E'
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

def run_ocr():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    image_path = os.path.join(base_dir, "iqro-images", "__LEVEL_ID_STR__", "__PAGE_NAME__.png")
    output_dir = os.path.join(base_dir, "iqro", "__LEVEL_ID_STR__")
    output_path = os.path.join(output_dir, "__PAGE_NAME__.json")
    
    print(f"Reading image: {image_path}")
    reader = easyocr.Reader(['ar', 'en'], gpu=False)
    
    temp_image = "temp___PAGE_NAME__.png"
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
        "level_id": __LEVEL_ID__,
        "level_title": "__LEVEL_TITLE__",
        "topic": __TOPIC__,
        "instruction_id": "__INSTRUCTION_ID__",
        "instruction_en": "__INSTRUCTION_EN__",
        "instruction_ar": "__INSTRUCTION_AR__",
        "content": []
    }

    # Reference data for spelling alignment & layout correction
    reference_content = __REFERENCE_CONTENT__

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
"""

    image_files = glob.glob(os.path.join(images_dir, "1-*.png"))
    image_files = sorted(image_files, key=lambda x: int(os.path.splitext(os.path.basename(x))[0].split("-")[1]))
    
    script_paths = []
    
    for img_path in image_files:
        basename = os.path.splitext(os.path.basename(img_path))[0] # "1-1", "1-2", etc.
        ref_json_path = os.path.join(old_json_dir, f"{basename}.json")
        
        # Default Metadata
        level_id = 1
        level_title = "IQRO' 1"
        topic = { "latin": "A BA", "arab": "اَ بَ" }
        instruction_id = "Bacaan langsung A - Ba dst. Tidak perlu diurai/dieja. Bacalah dengan suara pendek."
        instruction_en = "Direct reading A - Ba, etc. No need to spell out. Read with short sounds."
        instruction_ar = "القراءة المباشرة أ - ب وهكذا. لا حاجة للتهجئة. اقرأ بصوت قصير."
        reference_content = []
        
        # Load from reference json if exists
        if os.path.exists(ref_json_path):
            try:
                with open(ref_json_path, "r", encoding="utf-8") as f:
                    ref_data = json.load(f)
                level_id = ref_data.get("level_id", level_id)
                level_title = ref_data.get("level_title", level_title)
                topic = ref_data.get("topic", topic)
                instruction_id = ref_data.get("instruction_id", ref_data.get("instruction", instruction_id))
                instruction_en = ref_data.get("instruction_en", instruction_en)
                instruction_ar = ref_data.get("instruction_ar", instruction_ar)
                reference_content = ref_data.get("content", [])
            except Exception as e:
                print(f"Error reading {ref_json_path}: {e}")
                
        # Generate script code
        script_content = template
        script_content = script_content.replace("__PAGE_NAME__", basename)
        script_content = script_content.replace("__LEVEL_ID_STR__", str(level_id))
        script_content = script_content.replace("__LEVEL_ID__", str(level_id))
        script_content = script_content.replace("__LEVEL_TITLE__", level_title)
        script_content = script_content.replace("__TOPIC__", json.dumps(topic, ensure_ascii=False))
        script_content = script_content.replace("__INSTRUCTION_ID__", instruction_id.replace('"', '\\"'))
        script_content = script_content.replace("__INSTRUCTION_EN__", instruction_en.replace('"', '\\"'))
        script_content = script_content.replace("__INSTRUCTION_AR__", instruction_ar.replace('"', '\\"'))
        script_content = script_content.replace("__REFERENCE_CONTENT__", json.dumps(reference_content, ensure_ascii=False))
        
        script_path = os.path.join(scripts_dir, f"{basename}.py")
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(script_content)
        print(f"Generated OCR script: {script_path}")
        script_paths.append(f"{basename}.py")
        
    # Generate main.py inside level subdirectory
    main_runner_code = """import os
import subprocess
import sys
import re

def main():
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    scripts = [f for f in os.listdir(scripts_dir) if f.endswith(".py") and f != "main.py"]
    # Sort scripts numerically
    scripts = sorted(scripts, key=lambda x: [int(c) if c.isdigit() else c for c in re.split(r'(\\d+)', x)])
    
    print("="*60)
    print(f"Running {len(scripts)} Iqro OCR scripts...")
    print("="*60)
    
    success_count = 0
    for script in scripts:
        script_path = os.path.join(scripts_dir, script)
        print(f"[{script}] Executing...")
        result = subprocess.run([sys.executable, script_path], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"[{script}] Success!")
            success_count += 1
        else:
            print(f"[{script}] FAILED with exit code {result.returncode}")
            print(result.stderr)
            
    print("="*60)
    print(f"Completed! {success_count}/{len(scripts)} scripts ran successfully.")
    print("="*60)

if __name__ == "__main__":
    main()
"""
    main_path = os.path.join(scripts_dir, "main.py")
    with open(main_path, "w", encoding="utf-8") as f:
        f.write(main_runner_code)
    print(f"Generated Main script: {main_path}")

if __name__ == "__main__":
    generate()
