from flask import Flask, request, jsonify
from flask_cors import CORS  # CORSをインポート
import os
import tensorflow as tf
from werkzeug.utils import secure_filename

# CORS設定
app = Flask(__name__)
CORS(app)  # アプリ全体にCORSを適用

# モデルの読み込み（モデルファイルのパスを指定）
model = tf.keras.models.load_model('/Users/ryutokanazawa/Desktop/hairvision/backend/pymodel.keras')  # モデルをロード

# アップロードフォルダと許可するファイルの設定
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads_py_male', methods=['POST'])
def upload_male_image():
    return process_image('male')

@app.route('/uploads_py_female', methods=['POST'])
def upload_female_image():
    return process_image('female')

def process_image(gender):
    if 'image' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # 画像をモデルに渡して予測を行う
        img = tf.keras.preprocessing.image.load_img(file_path, target_size=(50, 50))  # Pillowを使用
        img_array = tf.keras.preprocessing.image.img_to_array(img) / 255.0
        img_array = tf.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)
        predicted_class = prediction.argmax()

        # 予測結果に基づいて髪型の画像を選定
        recommended_image, face_type = get_recommended_hairstyle(predicted_class, gender)
        return jsonify({
            "recommended_image": recommended_image,
            "face_type": face_type  # 顔のタイプも一緒に返す
        })

def get_recommended_hairstyle(predicted_class, gender):
    # 性別と予測結果に基づき、髪型のフォルダから画像を選択
    hairstyles = {
        "male": ["hosogao_male", "marugao_male"],
        "female": ["hosogao_female", "marugao_female"]
    }

    gender_map = hairstyles.get(gender)

    # predicted_classがgender_mapの範囲内であるか確認
    if predicted_class < len(gender_map):
        recommended_folder = gender_map[predicted_class]
    else:
        # 範囲外の場合はデフォルトの髪型を選ぶ（例: 丸顔）
        recommended_folder = gender_map[0]  # 例えば、丸顔の髪型に戻す

    # 顔のタイプを判定
    if predicted_class == 0:
        face_type = "Round face"
    elif predicted_class == 1:
        face_type = "Long face"
    elif predicted_class == 2:
        face_type = "Round face"
    else:
        face_type = "Long face"

    # 髪型の画像パスを取得
    recommended_image_path = os.path.join('static', recommended_folder, os.listdir(f'static/{recommended_folder}')[0])
    return f"/{recommended_image_path}", face_type

if __name__ == '__main__':
    app.run(debug=True, port=5003)