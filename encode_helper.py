import b64runner, base64
def save_text(path, text):
    b64 = base64.b64encode(text.strip().encode('utf-8')).decode('utf-8')
    b64runner.save(path, b64)
