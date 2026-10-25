from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

source = Path(r'C:\Users\corsi\Downloads\image_1ffd041.jpg')
target = Path.cwd() / 'poster-output' / 'CouncilForge_upscaled_MScIT.png'
scale = 4
image = Image.open(source).convert('RGB')
image = image.resize((image.width * scale, image.height * scale), Image.Resampling.LANCZOS)

# Replace only the adviser credential in the original top credit line.
draw = ImageDraw.Draw(image)
draw.rectangle((1245, 738, 2300, 815), fill=(12, 53, 35))
font = ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf', 27)
draw.text((1265, 755), '|  Adviser: Richie A. Cabangon, MSc IT', font=font, fill=(239, 244, 231))

target.parent.mkdir(exist_ok=True)
image.save(target, quality=95, subsampling=0)
print(target)
