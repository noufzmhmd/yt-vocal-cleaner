import sys
import torch
import torchaudio
import os

def load_audio(path, sr=44100):
    wav, source_sr = torchaudio.load(path)
    if source_sr != sr:
        wav = torchaudio.functional.resample(wav, source_sr, sr)
    if wav.shape[0] > 2:
        wav = wav[:2, :]
    return wav, sr

def save_audio(path, wav, sr=44100):
    torchaudio.save(path, wav, sr)

def main():
    if len(sys.argv) < 3:
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    device = "cuda" if torch.cuda.is_available() else "cpu"

    model = torch.hub.load(
        "facebookresearch/demucs",
        "htdemucs",
        source="github"
    ).to(device)
    model.eval()

    wav, sr = load_audio(input_path)
    wav = wav.to(device)

    with torch.no_grad():
        out = model(wav.unsqueeze(0))
    sources = out[0]

    stems = {
      "drums": 0,
      "bass": 1,
      "other": 2,
      "vocals": 3
    }

    vocals = sources[stems["vocals"]].detach().cpu()
    vocals = vocals.unsqueeze(0)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    save_audio(output_path, vocals, sr)

if __name__ == "__main__":
    main()
