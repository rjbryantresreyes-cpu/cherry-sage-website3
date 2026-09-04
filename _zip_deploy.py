import zipfile, os
root = r"C:\BBC\cherry-sage-website3"
zp   = r"C:\Users\GT\AppData\Local\Temp\claude\G--Shared-drives-BBC-Drive\a4016963-7403-46d2-b23a-0dd187ead902\scratchpad\cs_deploy.zip"
skip_ext = {'.py', '.pyc'}
skip_pre = ('_v_', '_home_preview', 'wp_', '_scratch', '_zip_')
n = 0
if os.path.exists(zp): os.remove(zp)
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    for dp, dn, fn in os.walk(root):
        if '__pycache__' in dp: continue
        for f in fn:
            ext = os.path.splitext(f)[1].lower()
            if ext in skip_ext: continue
            if f.startswith(skip_pre): continue
            if ext == '.json' and dp == root: continue
            full = os.path.join(dp, f)
            rel = os.path.relpath(full, root).replace('\\', '/')
            z.write(full, rel); n += 1
print("zipped", n, "files ->", zp)
