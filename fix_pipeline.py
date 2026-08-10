import re

with open('backend/ml/pipeline.py', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if 101 <= i <= 279:
        if line.startswith("    "):
            new_lines.append(line[4:])
        else:
            new_lines.append(line)
    elif i == 89 or i == 90 or i == 91:
        # skip lines 89-91
        continue
    else:
        new_lines.append(line)

with open('backend/ml/pipeline.py', 'w') as f:
    f.writelines(new_lines)
