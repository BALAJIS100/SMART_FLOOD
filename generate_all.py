import os

def write_f(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as out:
        out.write(text.strip() + '\n')
    print('Created:', path)

print('generate_all initialized')
