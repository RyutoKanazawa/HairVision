import dlib
from PIL import Image

def align_face(filepath, predictor_path="./models/pretrained/shape_predictor_68_face_landmarks.dat"):
    predictor = dlib.shape_predictor(predictor_path)
    detector = dlib.get_frontal_face_detector()
    img = dlib.load_rgb_image(filepath)
    dets = detector(img, 1)
    if len(dets) == 0:
        raise ValueError("No face detected in the image.")
    shape = predictor(img, dets[0])
    aligned = dlib.get_face_chip(img, shape)
    return Image.fromarray(aligned)