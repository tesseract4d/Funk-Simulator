import os

a = 'const list={'
for dir in os.listdir('.'):
    if os.path.isdir(dir):
        a += '"' + dir + '":['
        os.chdir(dir)
        for sub_dir in os.listdir('.'):
            if os.path.isdir(sub_dir):
                a += '"' + sub_dir + '",'
        a = a[:-1] + '],'
        os.chdir('..')
a = a[:-1] + '}'
with open('list.js', 'w') as f:
    f.write(a)
