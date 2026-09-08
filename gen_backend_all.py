import b64runner, base64
def save_code(p, text):
    b64 = base64.b64encode(text.strip().encode()).decode()
    b64runner.save(p, b64)
print('gen_backend_all ready')
