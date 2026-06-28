import os
import shutil
import glob

def reorganize():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    level = "1"
    
    # 1. iqro/1-*.json -> iqro/1/1-*.json
    iqro_src_dir = os.path.join(base_dir, "iqro")
    iqro_dst_dir = os.path.join(base_dir, "iqro", level)
    os.makedirs(iqro_dst_dir, exist_ok=True)
    json_files = glob.glob(os.path.join(iqro_src_dir, f"{level}-*.json"))
    for file in json_files:
        dest = os.path.join(iqro_dst_dir, os.path.basename(file))
        shutil.move(file, dest)
        print(f"Moved JSON: {file} -> {dest}")
        
    # 2. iqro-images/1-*.png -> iqro-images/1/1-*.png
    img_src_dir = os.path.join(base_dir, "iqro-images")
    img_dst_dir = os.path.join(base_dir, "iqro-images", level)
    os.makedirs(img_dst_dir, exist_ok=True)
    png_files = glob.glob(os.path.join(img_src_dir, f"{level}-*.png"))
    for file in png_files:
        dest = os.path.join(img_dst_dir, os.path.basename(file))
        shutil.move(file, dest)
        print(f"Moved Image: {file} -> {dest}")
        
    # 3. ocr-scripts/iqro/1-*.py -> ocr-scripts/iqro/1/1-*.py
    script_src_dir = os.path.join(base_dir, "ocr-scripts", "iqro")
    script_dst_dir = os.path.join(base_dir, "ocr-scripts", "iqro", level)
    os.makedirs(script_dst_dir, exist_ok=True)
    py_files = glob.glob(os.path.join(script_src_dir, f"{level}-*.py"))
    for file in py_files:
        dest = os.path.join(script_dst_dir, os.path.basename(file))
        shutil.move(file, dest)
        print(f"Moved Script: {file} -> {dest}")
        
    # Move main.py to ocr-scripts/iqro/1/main.py if exists in parent
    main_src = os.path.join(script_src_dir, "main.py")
    if os.path.exists(main_src):
        main_dest = os.path.join(script_dst_dir, "main.py")
        shutil.move(main_src, main_dest)
        print(f"Moved Main Script: {main_src} -> {main_dest}")

if __name__ == "__main__":
    reorganize()
