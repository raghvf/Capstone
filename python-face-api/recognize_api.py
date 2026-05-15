"""
Face enrollment and recognition API (Flask).
Run: python recognize_api.py
Requires: opencv-contrib-python (provides cv2.face / LBPH).
"""
import base64
import os
from datetime import datetime

import cv2
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

ROOT = os.path.dirname(os.path.abspath(__file__))
FACES_DIR = os.path.join(ROOT, "faces")
LOGS_DIR = os.path.join(ROOT, "recognition_logs")

app = Flask(__name__)
CORS(app)

CONFIDENCE_UNKNOWN_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "78.0"))
MIN_ENROLLMENT_IMAGES = int(os.getenv("MIN_ENROLLMENT_IMAGES", "3"))
MAX_ENROLLMENT_IMAGES = int(os.getenv("MAX_ENROLLMENT_IMAGES", "20"))

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


def _preprocess_face(gray_face):
    """Normalize lighting and resize for consistent LBPH recognition."""
    face = cv2.resize(gray_face, (200, 200))
    face = cv2.equalizeHist(face)
    return face


def _detect_faces(gray, face_cascade):
    return face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=6,
        minSize=(80, 80),
    )


def _log_recognition(usn, confidence, status, faces_detected=0, extra=None):
    os.makedirs(LOGS_DIR, exist_ok=True)
    log_file = os.path.join(LOGS_DIR, f"log_{datetime.now().strftime('%Y%m%d')}.txt")
    line = (
        f"{datetime.now().isoformat()} | status={status} | usn={usn} | "
        f"confidence={confidence} | faces={faces_detected}"
    )
    if extra:
        line += f" | {extra}"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def train_model():
    recognizer = cv2.face.LBPHFaceRecognizer_create(1, 8, 8, 8)
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
            faces.append(_preprocess_face(img))
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


def invalidate_cache():
    global _faces_mtime_cache
    _faces_mtime_cache = None


@app.route("/enroll", methods=["POST"])
def enroll():
    data = request.get_json(silent=True) or {}
    usn = str(data.get("usn", "")).strip().upper()
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

    detected = _detect_faces(gray, face_cascade)
    if len(detected) == 0:
        return jsonify({"message": "No face detected. Ensure good lighting and face the camera."}), 400

    if len(detected) > 1:
        return jsonify({
            "message": "Multiple faces detected. Only one person should be in frame.",
            "faces_detected": len(detected),
        }), 400

    student_folder = os.path.join(FACES_DIR, usn)
    os.makedirs(student_folder, exist_ok=True)

    existing = [
        f for f in os.listdir(student_folder) if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]
    if len(existing) >= MAX_ENROLLMENT_IMAGES:
        return jsonify({
            "message": f"Maximum {MAX_ENROLLMENT_IMAGES} enrollment images reached for {usn}",
            "image_count": len(existing),
        }), 400

    saved = 0
    for (x, y, w, h) in detected:
        face = _preprocess_face(gray[y : y + h, x : x + w])
        count = len(existing) + saved + 1
        filename = os.path.join(student_folder, f"{usn}_{count}.jpg")
        cv2.imwrite(filename, face)
        saved += 1

    invalidate_cache()
    total_images = len(existing) + saved

    return jsonify({
        "message": f"Enrollment complete ({saved} face image(s) saved)",
        "usn": usn,
        "image_count": total_images,
        "enrollment_valid": total_images >= MIN_ENROLLMENT_IMAGES,
        "min_required": MIN_ENROLLMENT_IMAGES,
    }), 200


@app.route("/recognize", methods=["POST"])
def recognize():
    data = request.get_json(silent=True) or {}
    image_data = data.get("image")

    if not image_data:
        _log_recognition(None, None, "no_image")
        return jsonify({"usn": "No image", "confidence": None, "status": "no_image"}), 400

    try:
        frame = _decode_image_bgr(image_data)
    except Exception:
        _log_recognition(None, None, "invalid_image")
        return jsonify({"usn": "Invalid image", "confidence": None, "status": "error"}), 400

    if frame is None:
        return jsonify({"usn": "Invalid image", "confidence": None, "status": "error"}), 400

    try:
        recognizer, label_reverse_map = get_recognizer()
    except ValueError as e:
        return jsonify({"usn": str(e), "confidence": None, "status": "error"}), 400

    cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
    face_cascade = cv2.CascadeClassifier(cascade_path)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = _detect_faces(gray, face_cascade)

    if len(faces) == 0:
        _log_recognition(None, None, "no_face", faces_detected=0)
        return jsonify({
            "usn": "No face detected",
            "confidence": None,
            "status": "no_face",
            "faces_detected": 0,
        })

    results = []
    for (x, y, w, h) in faces:
        face_img = _preprocess_face(gray[y : y + h, x : x + w])
        label, confidence = recognizer.predict(face_img)
        usn = label_reverse_map.get(label, "Unknown")
        status = "recognized"

        if confidence > CONFIDENCE_UNKNOWN_THRESHOLD:
            usn = "Unknown"
            status = "unknown"

        _log_recognition(usn, float(confidence), status, faces_detected=len(faces))
        results.append({
            "usn": usn,
            "confidence": float(confidence),
            "status": status,
        })

    primary = results[0]
    return jsonify({
        "usn": primary["usn"],
        "confidence": primary["confidence"],
        "status": primary["status"],
        "faces_detected": len(faces),
        "all_results": results,
    })


@app.route("/enrollment-status/<usn>", methods=["GET"])
def enrollment_status(usn):
    usn = usn.upper()
    folder = os.path.join(FACES_DIR, usn)
    if not os.path.isdir(folder):
        return jsonify({"usn": usn, "enrolled": False, "image_count": 0})

    count = len([f for f in os.listdir(folder) if f.lower().endswith((".jpg", ".jpeg", ".png"))])
    return jsonify({
        "usn": usn,
        "enrolled": count > 0,
        "image_count": count,
        "enrollment_valid": count >= MIN_ENROLLMENT_IMAGES,
        "min_required": MIN_ENROLLMENT_IMAGES,
    })


@app.route("/retrain", methods=["POST"])
def retrain():
    try:
        invalidate_cache()
        get_recognizer()
        return jsonify({"message": "Model retrained successfully"}), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400


@app.route("/health", methods=["GET"])
def health():
    ok = os.path.isdir(FACES_DIR) and bool(os.listdir(FACES_DIR))
    enrolled_count = 0
    if os.path.isdir(FACES_DIR):
        enrolled_count = len([d for d in os.listdir(FACES_DIR) if os.path.isdir(os.path.join(FACES_DIR, d))])
    return jsonify({
        "ok": True,
        "has_enrollments": ok,
        "enrolled_students": enrolled_count,
        "cv2_face": hasattr(cv2, "face"),
        "confidence_threshold": CONFIDENCE_UNKNOWN_THRESHOLD,
    })


if __name__ == "__main__":
    os.makedirs(FACES_DIR, exist_ok=True)
    os.makedirs(LOGS_DIR, exist_ok=True)
    host = os.getenv("FACE_API_HOST", "127.0.0.1")
    port = int(os.getenv("FACE_API_PORT", "5000"))
    print(f"[face-api] faces directory: {FACES_DIR}")
    print(f"[face-api] cv2.face available: {hasattr(cv2, 'face')}")
    app.run(host=host, port=port, debug=False)
