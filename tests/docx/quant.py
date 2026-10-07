from PIL import Image
import glob, os
n=0
for f in glob.glob('shots/*.png'):
    im=Image.open(f)
    if im.mode=='P': continue
    q=im.convert('RGB').quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE); q.save(f,optimize=True); n+=1
print('quantised',n, sum(os.path.getsize(f) for f in glob.glob('shots/*.png'))/1e6,'MB')
