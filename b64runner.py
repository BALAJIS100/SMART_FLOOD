import base64, os
def save(path, b64):
    d = os.path.dirname(path)
    if d: os.makedirs(d, exist_ok=True)
    b64 = b64.strip()
    pad = len(b64) % 4
    if pad: b64 += '=' * (4 - pad)
    with open(path, 'wb') as f:
        f.write(base64.b64decode(b64.encode('utf-8')))
    print('Saved:', path)
