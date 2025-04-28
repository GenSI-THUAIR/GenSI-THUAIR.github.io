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
        # new_size = 90
        left = (width - new_size)/2
        top = (height - new_size)/2
        right = (width + new_size)/2
        bottom = (height + new_size)/2
        img = img.crop((left, top, right, bottom))
        img.save(path)

def resize_squarify(img_dir:str, edge:int=90, recursive:bool=False):
    for img in os.listdir(img_dir):
        path = osp.join(img_dir, img)
        if osp.isdir(path):
            if recursive:
                resize_squarify(path, recursive)
            else:
                continue
        assert path.split('.')[-1] in IMAGE_EXT, \
            f"{path} with unexpected extend without {IMAGE_EXT}"

        img = Image.open(path)
        width, height = img.size
        left = 0
        right = width
        top = 0
        bottom = height

        if width > edge:
            wdiff = width - edge
            left = wdiff//2
            right -= wdiff - left

        if height > edge:
            hdiff = height - edge
            top = hdiff//2
            bottom -= hdiff - top

        canvas = Image.new("RGBA", (edge, edge), (0, 0, 0, 0))
        img_crop = img.crop((left, top, right, bottom))
        
        # center paste
        x = (edge - width)//2
        y = (edge - height)//2
        canvas.paste(img_crop, (x, y))
        canvas.save(path)

if __name__ == "__main__":
    # make_image_square("assets/lab-pics")
    # resize_squarify("assets/main-pics")
    resize_squarify("assets/misc-pics", 14)