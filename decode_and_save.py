import os, json
if os.path.exists('files_data.json'):
    data = json.load(open('files_data.json', encoding='utf-8'))
    for path, content in data.items():
        d = os.path.dirname(path)
        if d: os.makedirs(d, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as out:
            out.write(content.strip() + '\n')
        print('Saved:', path)
