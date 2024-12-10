import os

def process_image(image):
    input_path = f"./temp/{image.filename}"
    output_path = f"./outputs/{os.path.splitext(image.filename)[0]}_processed.png"

    # 必要なディレクトリを作成
    os.makedirs("./temp", exist_ok=True)
    os.makedirs("./outputs", exist_ok=True)

    # 入力ファイルを保存
    image.save(input_path)

    # 仮の処理（HairCLIPモデルに置き換える）
    from PIL import Image
    img = Image.open(input_path)
    img.save(output_path)

    return output_path