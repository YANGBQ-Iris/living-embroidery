"""Local U2Net segmentation; input bytes never leave this computer."""
import json, sys, warnings
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps
import onnxruntime as ort

Image.MAX_IMAGE_PIXELS = 25_000_000
warnings.simplefilter('error', Image.DecompressionBombWarning)
source, target, model = map(Path, sys.argv[1:4])
with Image.open(source) as opened:
    if opened.format not in ('PNG', 'JPEG', 'WEBP'):
        raise ValueError('Only PNG, JPEG and WebP images are supported')
    image = ImageOps.exif_transpose(opened).convert('RGBA')
image.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
rgb = np.asarray(image.convert('RGB').resize((320, 320), Image.Resampling.LANCZOS), dtype=np.float32)
rgb /= max(float(rgb.max()), 1.0)
rgb = (rgb - np.array([.485, .456, .406], dtype=np.float32)) / np.array([.229, .224, .225], dtype=np.float32)
tensor = rgb.transpose((2, 0, 1))[None].astype(np.float32)
opts = ort.SessionOptions()
opts.intra_op_num_threads = 4
session = ort.InferenceSession(str(model), sess_options=opts, providers=['CPUExecutionProvider'])
mask = session.run(None, {session.get_inputs()[0].name: tensor})[0][0, 0]
mask = (mask - mask.min()) / max(float(mask.max() - mask.min()), 1e-6)
mask = Image.fromarray(np.uint8(np.clip(mask * 255, 0, 255))).resize(image.size, Image.Resampling.LANCZOS)
# Already-cut PNGs keep their original leaf and stem edges.
if image.getchannel('A').getextrema()[0] < 255:
    mask = image.getchannel('A')
# Preserve existing transparency rather than restoring removed pixels.
mask = Image.fromarray(np.minimum(np.asarray(mask), np.asarray(image.getchannel('A'))))
image.putalpha(mask)
bounds = mask.point(lambda p: 255 if p > 28 else 0).getbbox()
if not bounds:
    raise ValueError('No foreground found')
image = image.crop(bounds)
image.thumbnail((900, 900), Image.Resampling.LANCZOS)
canvas = Image.new('RGBA', (1280, 1080), (0, 0, 0, 0))
canvas.alpha_composite(image, ((1280-image.width)//2, (1080-image.height)//2))
canvas.save(target, format='PNG')
black = Image.new('RGB', canvas.size, 'black')
black.paste(canvas, mask=canvas.getchannel('A'))
black.save(target.with_suffix('.black.png'), format='PNG')
print(json.dumps({'width':1280,'height':1080}))
