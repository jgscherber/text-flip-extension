"""Run this script once to generate PNG icons: python generate_icons.py"""
import struct, zlib, os

def make_png(size, color_bg=(30, 30, 46), color_fg=(203, 166, 247)):
    """Generate a minimal PNG with a simple 'F' glyph."""
    img = [color_bg] * (size * size)

    # Draw a thick border square
    border = max(1, size // 10)
    for y in range(size):
        for x in range(size):
            if x < border or x >= size - border or y < border or y >= size - border:
                img[y * size + x] = color_fg

    # Draw a stylised 'T' (flip arrow) in the center
    cx, cy = size // 2, size // 2
    thick = max(1, size // 8)
    bar_h = max(1, size // 4)
    bar_w = size // 2

    for y in range(cy - bar_h, cy + bar_h):
        for x in range(cx - thick // 2, cx + thick // 2 + 1):
            if 0 <= y < size and 0 <= x < size:
                img[y * size + x] = color_fg

    for x in range(cx - bar_w // 2, cx + bar_w // 2 + 1):
        for y in range(cy - bar_h, cy - bar_h + thick + 1):
            if 0 <= y < size and 0 <= x < size:
                img[y * size + x] = color_fg

    # Build raw PNG bytes
    def pack_chunk(chunk_type, data):
        crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    raw = b""
    for y in range(size):
        raw += b"\x00"
        for x in range(size):
            r, g, b = img[y * size + x]
            raw += bytes([r, g, b])
    idat = zlib.compress(raw)

    png = b"\x89PNG\r\n\x1a\n"
    png += pack_chunk(b"IHDR", ihdr)
    png += pack_chunk(b"IDAT", idat)
    png += pack_chunk(b"IEND", b"")
    return png

for size in (16, 48, 128):
    path = os.path.join(os.path.dirname(__file__), f"icon{size}.png")
    with open(path, "wb") as f:
        f.write(make_png(size))
    print(f"Written {path}")
