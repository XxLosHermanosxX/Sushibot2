import base64

# SVG do ícone do Sushi Aki
svg_template = '''<svg width="{size}" height="{size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#ff6b6b"/>
  <text x="256" y="320" font-size="280" text-anchor="middle" fill="white">🍣</text>
</svg>'''

sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]

for size in sizes:
    svg = svg_template.format(size=size)
    filename = f"icon-{size}x{size}.svg"
    with open(filename, 'w') as f:
        f.write(svg)
    print(f"Created {filename}")
