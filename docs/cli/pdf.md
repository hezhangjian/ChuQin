# PDF

The `pdf` module contains commands for PDF-related integrations in ChuQin.

## `to-ppt` Command

Convert a PDF into a PowerPoint deck with one rendered slide per PDF page.

```bash
chuqin pdf to-ppt ./demo.pdf
```

### Options

Choose an explicit output path:

```bash
chuqin pdf to-ppt ./demo.pdf -o ./output/demo.pptx
```

Overwrite an existing file:

```bash
chuqin pdf to-ppt ./demo.pdf --overwrite
```
