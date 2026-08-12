import os
from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

SRC_DIR = r"C:\Users\f3645\Pictures\阶段性述职报告PPT"
OUT_DIR = r"d:\space-codebuddy-project2\rebecca-project"
OUT_FILE = os.path.join(OUT_DIR, "独立站自建规划.pdf")

# 收集图片，按数字序号排序
files = []
for name in os.listdir(SRC_DIR):
    if name.lower().endswith(".png"):
        base = os.path.splitext(name)[0]
        try:
            idx = int(base)
            files.append((idx, name))
        except ValueError:
            pass
files.sort(key=lambda x: x[0])

images = []
for idx, name in files:
    path = os.path.join(SRC_DIR, name)
    img = Image.open(path)
    img.load()
    if img.mode in ("RGBA", "P", "LA"):
        # 转成 RGB 以免 PDF 不支持某些模式
        img = img.convert("RGB")
    images.append(img)

# 用 reportlab canvas，每页尺寸等于图片像素尺寸（点：1pt = 1/72 inch，像素按像素=点映射）
c = canvas.Canvas(OUT_FILE, pagesize=(1, 1))

for img in images:
    w, h = img.size
    c.setPageSize((w, h))
    # 左上角为原点绘制，reportlab 原点在左下角，直接用图片尺寸全幅铺满
    c.drawImage(ImageReader(img), 0, 0, width=w, height=h, preserveAspectRatio=False)
    c.showPage()

c.save()
print(f"Generated {OUT_FILE} with {len(images)} pages.")
print("Pages:", [f[0] for f in files])
