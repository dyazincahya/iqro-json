import os
import subprocess
import sys
import re

def main():
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    scripts = [f for f in os.listdir(scripts_dir) if f.endswith(".py") and f != "main.py"]
    # Sort scripts numerically
    scripts = sorted(scripts, key=lambda x: [int(c) if c.isdigit() else c for c in re.split(r'(\d+)', x)])
    
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
