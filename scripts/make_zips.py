#!/usr/bin/env python3
import os
import zipfile
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')
TEMPLATES_DIR = os.path.join(ROOT_DIR, 'scripts', 'server_templates')

os.makedirs(PUBLIC_DIR, exist_ok=True)

# 0. Copy offline server templates into dist/
if os.path.exists(TEMPLATES_DIR):
    for f in os.listdir(TEMPLATES_DIR):
        src_path = os.path.join(TEMPLATES_DIR, f)
        dst_path = os.path.join(DIST_DIR, f)
        shutil.copy2(src_path, dst_path)
        print(f"Copied template to dist: {f}")

# 1. Create amasa-dist.zip (Pure production distribution)
dist_zip_path = os.path.join(PUBLIC_DIR, 'amasa-dist.zip')
if os.path.exists(dist_zip_path):
    os.remove(dist_zip_path)

print(f"Creating {dist_zip_path} (Pure production distribution)...")
DIST_ALLOWED_PREFIXES = ('index.html', 'assets', '.htaccess', 'CYBERPANEL_INSTRUCTIONS.txt', 'serve.cjs', 'serve.mjs', 'serve.py', 'README.txt')

with zipfile.ZipFile(dist_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(DIST_DIR):
        for file in files:
            abs_path = os.path.join(root, file)
            rel_path = os.path.relpath(abs_path, DIST_DIR)
            if any(rel_path == item or rel_path.startswith(item + os.sep) for item in DIST_ALLOWED_PREFIXES):
                zipf.write(abs_path, rel_path)
                print(f"  + dist: {rel_path}")

print("amasa-dist.zip created successfully.")

# 2. Create amasa-cyberpanel.zip (Specifically formatted for CyberPanel public_html)
cyberpanel_zip_path = os.path.join(PUBLIC_DIR, 'amasa-cyberpanel.zip')
if os.path.exists(cyberpanel_zip_path):
    os.remove(cyberpanel_zip_path)

print(f"Creating {cyberpanel_zip_path} (CyberPanel Optimized Package)...")
CYBERPANEL_ALLOWED_PREFIXES = ('index.html', 'assets', '.htaccess', 'CYBERPANEL_INSTRUCTIONS.txt', 'serve.cjs')

with zipfile.ZipFile(cyberpanel_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(DIST_DIR):
        for file in files:
            abs_path = os.path.join(root, file)
            rel_path = os.path.relpath(abs_path, DIST_DIR)
            if any(rel_path == item or rel_path.startswith(item + os.sep) for item in CYBERPANEL_ALLOWED_PREFIXES):
                zipf.write(abs_path, rel_path)
                print(f"  + cyberpanel: {rel_path}")

print("amasa-cyberpanel.zip created successfully.")

# 3. Create amasa-source.zip & amasa-base44.zip (Clean source code only for Base44 / GitHub / Node)
source_zip_path = os.path.join(PUBLIC_DIR, 'amasa-source.zip')
base44_zip_path = os.path.join(PUBLIC_DIR, 'amasa-base44.zip')

for p in (source_zip_path, base44_zip_path):
    if os.path.exists(p):
        os.remove(p)

print(f"Creating {base44_zip_path} (Base44 / GitHub Optimized Package)...")
BASE44_ROOT_FILES = [
    'index.html',
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'server.ts',
    '.env.example',
    '.gitignore',
    'metadata.json',
    'README.md',
    'BASE44_GUIDE.md',
]

def build_source_zip(target_zip):
    with zipfile.ZipFile(target_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for f in BASE44_ROOT_FILES:
            p = os.path.join(ROOT_DIR, f)
            if os.path.exists(p):
                zipf.write(p, f)
                print(f"  + base44 root: {f}")
        
        # Add src/ directory recursively
        src_dir = os.path.join(ROOT_DIR, 'src')
        for root, dirs, files in os.walk(src_dir):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, ROOT_DIR)
                zipf.write(abs_path, rel_path)
        
        # Add public/ static assets (excluding generated .zip files)
        pub_dir = os.path.join(ROOT_DIR, 'public')
        for root, dirs, files in os.walk(pub_dir):
            for file in files:
                if file.endswith('.zip'):
                    continue
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, ROOT_DIR)
                zipf.write(abs_path, rel_path)

build_source_zip(base44_zip_path)
build_source_zip(source_zip_path)
print("amasa-base44.zip and amasa-source.zip created successfully.")

# Copy all zips into dist/ so they are also available when hosted
shutil.copy2(dist_zip_path, os.path.join(DIST_DIR, 'amasa-dist.zip'))
shutil.copy2(cyberpanel_zip_path, os.path.join(DIST_DIR, 'amasa-cyberpanel.zip'))
shutil.copy2(source_zip_path, os.path.join(DIST_DIR, 'amasa-source.zip'))
shutil.copy2(base44_zip_path, os.path.join(DIST_DIR, 'amasa-base44.zip'))

print("All zips (including amasa-base44.zip) generated and placed in public/ and dist/.")

