# PDF

Commands for converting PDF documents into PowerPoint decks.

## Convert A PDF Into PPT

Render each PDF page into an image, then place that image on its own `16:9` slide.

```bash
chuqin pdf to-ppt ./demo.pdf
```

Render more sharply for text-heavy PDFs:

```bash
chuqin pdf to-ppt ./demo.pdf --render-scale 4
```

Choose an explicit output path:

```bash
chuqin pdf to-ppt ./demo.pdf -o ./demo.pptx
```

Keep intermediate page images in a working directory:

```bash
chuqin pdf to-ppt ./demo.pdf --work-dir ./tmp/pdf-pages --keep-images
```

Notes:

- PDF page rasterization uses `PyMuPDF`, so it is not tied to macOS.
- `--render-scale` 越高，输出越清晰，但转换更慢、PPT 文件也会更大。
- The resulting PPT uses PowerPoint widescreen `13.333" x 7.5"` and keeps each page image centered with aspect ratio preserved.
