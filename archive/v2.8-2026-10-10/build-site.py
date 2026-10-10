#!/usr/bin/env python3
"""Build the web app into _site/ from the single source file.

Source of truth: LifeGoals-Customer-Journey-Prototype.html (edit THIS file).
This script adds the phone-install tags (manifest, icons, service worker) and
copies the assets, so index.html never has to be edited or kept in sync by hand.
Used by .github/workflows/pages.yml; run `python3 build-site.py` to test locally.
"""
import os, shutil

SRC = 'LifeGoals-Customer-Journey-Prototype.html'
OUT = '_site'

VIEWPORT = '<meta name="viewport" content="width=device-width,initial-scale=1">'
HEAD_ADD = ('\n<meta name="theme-color" content="#0B2545"><link rel="manifest" href="manifest.webmanifest">'
            '<link rel="icon" type="image/png" href="icons/icon-192.png"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png">'
            '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
            '<meta name="apple-mobile-web-app-title" content="LifeMap"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">')
REGISTER = ('<script>try{if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)&&window.top===window)'
            '{window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})}}catch(e){}</script>')

html = open(SRC, encoding='utf8').read()
if VIEWPORT not in html or '</body>' not in html:
    raise SystemExit('build-site: expected viewport tag and </body> not found in ' + SRC)
html = html.replace(VIEWPORT, VIEWPORT + HEAD_ADD, 1)
i = html.rindex('</body>')
html = html[:i] + REGISTER + html[i:]

if os.path.isdir(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf8').write(html)
for f in ('manifest.webmanifest', 'sw.js'):
    shutil.copy(f, OUT)
shutil.copytree('icons', os.path.join(OUT, 'icons'))
shutil.copytree('media', os.path.join(OUT, 'media'))
open(os.path.join(OUT, '.nojekyll'), 'w').close()
print('built', OUT, os.path.getsize(os.path.join(OUT, 'index.html')), 'bytes index.html')
