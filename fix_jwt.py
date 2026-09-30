import re

def fix_file(path):
    with open(path, 'r') as f:
        content = f.read()

    # Remove jwtDecode import
    content = re.sub(r'import\s+\{\s*jwtDecode\s*\}\s+from\s+[\'"]jwt-decode[\'"];?\n', '', content)

    # Replace jwtDecode(token) with JSON.parse(atob(token.split('.')[1]))
    content = content.replace('jwtDecode(res.data.token)', "JSON.parse(atob(res.data.token.split('.')[1]))")
    content = content.replace('jwtDecode(token)', "JSON.parse(atob(token.split('.')[1]))")

    with open(path, 'w') as f:
        f.write(content)

fix_file('frontend/src/pages/Landing.jsx')
fix_file('frontend/src/pages/Login.jsx')
