"""
Face enrollment and recognition API (Flask).
Run: python recognize_api.py
Requires: opencv-contrib-python (provides cv2.face / LBPH).
"""
import base64
import os

import cv2
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

ROOT = os.path.dirname(os.path.abspath(__file__))
FACES_DIR = os.path.join(ROOT, "faces")

app = Flask(__name__)
CORS(app)

# LBPH: lower confidence = better match. Values > ~70–80 are usually wrong / unknown.
CONFIDENCE_UNKNOWN_THRESHOLD = 78.0

_recognizer_cache = None
_label_reverse_map_cache = None
_faces_mtime_cache = None


def _faces_dir_mtime():
    if not os.path.isdir(FACES_DIR):
        return 0.0
    latest = 0.0
    for dirpath, _dirnames, filenames in os.walk(FACES_DIR):
        for name in filenames:
            if name.lower().endswith((".jpg", ".jpeg", ".png")):
                try:
                    latest = max(latest, os.path.getmtime(os.path.join(dirpath, name)))
                except OSError:
                    continue
    return latest


def _decode_image_bgr(image_data: str):
    if "," in image_data:
        b64 = image_data.split(",", 1)[1]
    else:
        b64 = image_data
    raw = base64.b64decode(b64)
    arr = np.frombuffer(raw, dtype=np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def train_model():
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    faces = []
    labels = []
    label_map = {}
    current_label = 0

    if not os.path.isdir(FACES_DIR):
        raise ValueError("No faces directory. Enroll at least one student first.")

    for person_usn in sorted(os.listdir(FACES_DIR)):
        person_folder = os.path.join(FACES_DIR, person_usn)
        if not os.path.isdir(person_folder):
            continue

        if person_usn not in label_map:
            label_map[person_usn] = current_label
            current_label += 1

        for img_file in sorted(os.listdir(person_folder)):
            if not img_file.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            img_path = os.path.join(person_folder, img_file)
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            if img is None:
                print(f"[WARN] Could not read image: {img_path}")
                continue
            faces.append(img)
            labels.append(label_map[person_usn])

    if len(faces) == 0:
        raise ValueError("No face images found for training.")

    recognizer.train(faces, np.array(labels))
    reverse = {v: k for k, v in label_map.items()}
    return recognizer, reverse


def get_recognizer():
    global _recognizer_cache, _label_reverse_map_cache, _faces_mtime_cache
    mtime = _faces_dir_mtime()
    if (
        _recognizer_cache is None
        or _label_reverse_map_cache is None
        or mtime != _faces_mtime_cache
    ):
        _recognizer_cache, _label_reverse_map_cache = train_model()
        _faces_mtime_cache = mtime
    return _recognizer_cache, _label_reverse_map_cache


@app.route("/enroll", methods=["POST"])
def enroll():
    data = request.get_json(silent=True) or {}
    usn = data.get("usn")
    image_data = data.get("image")

    if not usn or not image_data:
        return jsonify({"message": "USN and image are required"}), 400

    try:
        img_bgr = _decode_image_bgr(image_data)
    except Exception:
        return jsonify({"message": "Invalid image format"}), 400

    if img_bgr is None:
        return jsonify({"message": "Could not decode image"}), 400

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
    face_cascade = cv2.CascadeClassifier(cascade_path)
    if face_cascade.empty():
        return jsonify({"message": "Face detector failed to load"}), 500

    detected = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
    if len(detected) == 0:
        return jsonify({"message": "No face detected"}), 400

    student_folder = os.path.join(FACES_DIR, str(usn))
    os.makedirs(student_folder, exist_ok=True)

    count = len(
        [f for f in os.listdir(student_folder) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    )
    saved = 0
    for (x, y, w, h) in detected:
        face = gray[y : y + h, x : x + w]
        count += 1
        filename = os.path.join(student_folder, f"{usn}_{count}.jpg")
        cv2.imwrite(filename, face)
        saved += 1

    global _faces_mtime_cache
    _faces_mtime_cache = None

    return jsonify({"message": f"Enrollment complete ({saved} face image(s) saved)"}), 200


@app.route("/recognize", methods=["POST"])
def recognize():
    data = request.get_json(silent=True) or {}
    image_data = data.get("image")

    if not image_data:
        return jsonify({"usn": "No image", "confidence": None}), 400

    try:
        frame = _decode_image_bgr(image_data)
    except Exception:
        return jsonify({"usn": "Invalid image", "confidence": None}), 400

    if frame is None:
        return jsonify({"usn": "Invalid image", "confidence": None}), 400

    try:
        recognizer, label_reverse_map = get_recognizer()
    except ValueError as e:
        return jsonify({"usn": str(e), "confidence": None}), 400

    cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
    face_cascade = cv2.CascadeClassifier(cascade_path)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    if len(faces) == 0:
        return jsonify({"usn": "No face detected", "confidence": None})

    for (x, y, w, h) in faces:
        face_img = gray[y : y + h, x : x + w]
        label, confidence = recognizer.predict(face_img)
        usn = label_reverse_map.get(label, "Unknown")
        if confidence > CONFIDENCE_UNKNOWN_THRESHOLD:
            usn = "Unknown"
        return jsonify({"usn": usn, "confidence": float(confidence)})

    return jsonify({"usn": "No face detected", "confidence": None})


@app.route("/health", methods=["GET"])
def health():
    ok = os.path.isdir(FACES_DIR) and bool(os.listdir(FACES_DIR))
    return jsonify({"ok": True, "has_enrollments": ok, "cv2_face": hasattr(cv2, "face")})


if __name__ == "__main__":
    os.makedirs(FACES_DIR, exist_ok=True)
    print(f"[face-api] faces directory: {FACES_DIR}")
    print(f"[face-api] cv2.face available: {hasattr(cv2, 'face')}")
    app.run(host="127.0.0.1", port=5000, debug=False)
