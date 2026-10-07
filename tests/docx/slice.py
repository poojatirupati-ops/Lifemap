from PIL import Image
import json, math
out={}
for g in ['prices','retire','safety','length']:
    im=Image.open('shots/A-%s.png'%g); w,h=im.size; n=math.ceil(h/2000); step=math.ceil(h/n); files=[]
    for i in range(n):
        f='A-%s-%d.png'%(g,i+1); im.crop((0,i*step,w,min(h,(i+1)*step))).save('shots/'+f); files.append(f)
    out[g]=files
json.dump(out,open('slices.json','w'))
print(out)
