import sys
import os
import subprocess

def main():
    if len(sys.argv) < 3:
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    # تشغيل Spleeter لفصل الصوت
    try:
        subprocess.run([
            "spleeter", "separate",
            "-p", "spleeter:2stems",
            "-o", "temp",
            input_path
        ], check=True)

        # الملف الناتج يكون داخل temp/<filename>/vocals.wav
        base = os.path.splitext(os.path.basename(input_path))[0]
        vocals_path = f"temp/{base}/vocals.wav"

        if not os.path.exists(vocals_path):
            sys.exit(1)

        os.rename(vocals_path, output_path)

    except Exception:
        sys.exit(1)

if __name__ == "__main__":
    main()
