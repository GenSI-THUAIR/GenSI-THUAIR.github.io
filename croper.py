import os
import os.path as osp
from PIL import Image

IMAGE_EXT = ["jpeg", "jpg", "png", "gif"]
def make_image_square(img_dir:str, recursive:bool=True):
    for img in os.listdir(img_dir):
        path = osp.join(img_dir, img)
        if osp.isdir(path) and recursive:
            make_image_square(path, recursive)
        assert path.split('.')[-1] in IMAGE_EXT, \
            f"{path} with unexpected extend without {IMAGE_EXT}"

        img = Image.open(path)
        width, height = img.size
        if width == height:
            continue
        print(f"cropping {path}")
        new_size = min(width, height)
        left = (width - new_size)/2
        top = (height - new_size)/2
        right = (width + new_size)/2
        bottom = (height + new_size)/2
        img = img.crop((left, top, right, bottom))
        img.save(path)

if __name__ == "__main__":
    make_image_square("assets/lab-pics")