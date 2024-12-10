import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
from tensorflow.keras.applications import VGG16
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, Dropout, Flatten, Input
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.optimizers import SGD
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
import time

# ===== ウェブスクレイピングで画像収集 =====
def download_images(keyword, folder, num_images=200):
    """指定されたキーワードで画像を取得し、フォルダに保存する"""
    url = f"https://www.google.com/search?q={keyword}&tbm=isch"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    image_tags = soup.find_all("img", limit=num_images)

    if not os.path.exists(folder):
        os.makedirs(folder)

    for i, img_tag in tqdm(enumerate(image_tags), desc=f"Downloading {keyword}", total=num_images):
        img_url = img_tag.get("src")
        if img_url:
            try:
                img_data = requests.get(img_url).content
                with open(f"{folder}/{keyword.replace(' ', '_')}_{i}.jpg", "wb") as img_file:
                    img_file.write(img_data)
            except Exception as e:
                print(f"Error downloading {img_url}: {e}")
        time.sleep(0.1)  # サーバーへの負荷を避けるために少し待つ

# 画像のダウンロード
download_images("丸顔 男性", "./data/marugao_male", num_images=200)
download_images("細顔 男性", "./data/hosogao_male", num_images=200)
download_images("丸顔 女性", "./data/marugao_female", num_images=200)
download_images("細顔 女性", "./data/hosogao_female", num_images=200)

# ===== データ前処理 =====
def preprocess_images(folder_path):
    """画像の読み込みと前処理"""
    images = []
    for img_name in os.listdir(folder_path):
        img_path = os.path.join(folder_path, img_name)
        img = cv2.imread(img_path)
        if img is not None:  # 読み込めた画像のみ処理
            try:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img = cv2.resize(img, (50, 50))
                img = img.astype('float32') / 255.0  # 正規化
                images.append(img)
            except Exception as e:
                print(f"Error processing image {img_path}: {e}")
        else:
            print(f"Skipping {img_path}: Unable to read image.")
    print(f"Loaded {len(images)} images from {folder_path}")
    return np.array(images)

# データ準備
categories = {
    "丸顔 男性": "./data/marugao_male",
    "細顔 男性": "./data/hosogao_male",
    "丸顔 女性": "./data/marugao_female",
    "細顔 女性": "./data/hosogao_female"
}

data = {}
for category, path in categories.items():
    data[category] = preprocess_images(path)

# ===== ラベルの作成 =====
X = np.concatenate([data["丸顔 男性"], data["細顔 男性"], data["丸顔 女性"], data["細顔 女性"]], axis=0)
y = np.array(
    [0] * len(data["丸顔 男性"]) +
    [1] * len(data["細顔 男性"]) +
    [2] * len(data["丸顔 女性"]) +
    [3] * len(data["細顔 女性"])
)

# データ分割
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
y_train = to_categorical(y_train, num_classes=4)
y_test = to_categorical(y_test, num_classes=4)

# ===== モデル構築 =====
input_tensor = Input(shape=(50, 50, 3))
vgg16 = VGG16(include_top=False, weights='imagenet', input_tensor=input_tensor)

top_model = Sequential()
top_model.add(Flatten())
top_model.add(Dense(256, activation='relu'))
top_model.add(Dropout(rate=0.5))
top_model.add(Dense(4, activation='softmax'))  # クラス数を4に変更

model = Model(inputs=vgg16.input, outputs=top_model(vgg16.output))

# ベースモデルの一部を固定
for layer in model.layers[:15]:
    layer.trainable = False

model.compile(
    loss='categorical_crossentropy',
    optimizer=SGD(learning_rate=1e-4, momentum=0.9),
    metrics=['accuracy']
)

# ===== モデル学習 =====
history = model.fit(X_train, y_train, batch_size=32, epochs=10, validation_data=(X_test, y_test))

# ===== モデル保存 =====
# 保存先ディレクトリを確認して作成
save_dir = '/Users/ryutokanazawa/Desktop/hairvision/backend'
if not os.path.exists(save_dir):
    os.makedirs(save_dir)

# モデルを指定したディレクトリに保存
model.save(os.path.join(save_dir, 'pymodel.keras'))  # 絶対パスで保存
print("Model saved as pymodel.keras")