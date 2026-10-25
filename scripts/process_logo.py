import os
from PIL import Image, ImageDraw, ImageFilter

src_path = r"C:\Users\User\.gemini\antigravity-ide\brain\487f8dab-3b33-4e7d-b9bb-76718d565c96\.user_uploaded\media_1792915066668.jpg"
public_dir = r"c:\Users\User\Documents\wellness diagnostic\public"
os.makedirs(public_dir, exist_ok=True)

img = Image.open(src_path).convert("RGBA")

# Center and radius based on exact bounding box
cx = (57 + 926) / 2.0  # 491.5
cy = (84 + 960) / 2.0  # 522.0
# Emblem radius is ~438px
# Let's take a square crop with 15px margin around the emblem
half_size = 455  # Total square side = 910px

crop_box = (
    int(cx - half_size),
    int(cy - half_size),
    int(cx + half_size),
    int(cy + half_size)
)
cropped = img.crop(crop_box)
w, h = cropped.size

# High-resolution supersampled anti-aliased circular mask
scale = 4
mask_hi = Image.new("L", (w * scale, h * scale), 0)
draw_hi = ImageDraw.Draw(mask_hi)
# Radius in high-res coordinates
r_hi = 442 * scale
cx_hi = (w * scale) / 2.0
cy_hi = (h * scale) / 2.0
draw_hi.ellipse(
    (cx_hi - r_hi, cy_hi - r_hi, cx_hi + r_hi, cy_hi + r_hi),
    fill=255
)
# Downsample for ultra-smooth anti-aliasing
mask = mask_hi.resize((w, h), Image.Resampling.LANCZOS)

# Create final transparent logo
logo_transparent = Image.new("RGBA", (w, h), (255, 255, 255, 0))
logo_transparent.paste(cropped, (0, 0), mask)

# Save main logo files
logo_transparent.save(os.path.join(public_dir, "logo.png"), format="PNG")
logo_transparent.save(os.path.join(public_dir, "logo-circle.png"), format="PNG")

# Also save white-background version for contexts where white plate is preferred
cropped.save(os.path.join(public_dir, "logo-solid.png"), format="PNG")
cropped.convert("RGB").save(os.path.join(public_dir, "logo.jpg"), quality=95)

# Standard icon sizes for web, PWA, favicons
for s in [16, 32, 48, 64, 128, 192, 256, 512]:
    resized = logo_transparent.resize((s, s), Image.Resampling.LANCZOS)
    resized.save(os.path.join(public_dir, f"logo-{s}.png"), format="PNG")

# Save as standard favicon.ico
logo_transparent.resize((48, 48), Image.Resampling.LANCZOS).save(
    os.path.join(public_dir, "favicon.ico"), format="ICO"
)

# Also save icon.png for Next.js App Router metadata
logo_transparent.resize((192, 192), Image.Resampling.LANCZOS).save(
    os.path.join(public_dir, "icon.png"), format="PNG"
)
logo_transparent.resize((180, 180), Image.Resampling.LANCZOS).save(
    os.path.join(public_dir, "apple-icon.png"), format="PNG"
)

# Also copy to src/app/icon.png if Next.js uses file-based icon
app_dir = r"c:\Users\User\Documents\wellness diagnostic\src\app"
logo_transparent.resize((192, 192), Image.Resampling.LANCZOS).save(
    os.path.join(app_dir, "icon.png"), format="PNG"
)
logo_transparent.resize((48, 48), Image.Resampling.LANCZOS).save(
    os.path.join(app_dir, "favicon.ico"), format="ICO"
)

print(f"Successfully processed logo! Size: {w}x{h}. Generated all favicon and app icons.")
