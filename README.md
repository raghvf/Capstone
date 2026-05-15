# 🎓 AI-Powered Face Recognition Attendance System

An AI-powered smart attendance management system that uses facial recognition to automate student attendance tracking in real time.

This project combines:
- Computer Vision
- Face Recognition
- Full Stack Web Development
- REST APIs
- MongoDB Database Management

The system allows administrators to:
- Enroll students using facial data
- Recognize students in real-time
- Automatically mark attendance
- Manage attendance records
- Track period-wise attendance
- Authenticate admin users

---

# 🚀 Features

## ✅ Face Enrollment
Students can register their face using webcam image capture.

## ✅ Real-Time Face Recognition
Recognizes enrolled students using OpenCV's LBPH face recognizer.

## ✅ Smart Attendance Logging
Automatically stores attendance records in MongoDB.

## ✅ Period-Wise Attendance
Attendance is tracked separately for subjects/classes based on time slots.

## ✅ Admin Authentication
Includes signup and signin functionality for administrators.

## ✅ Full Stack Architecture
Integrated frontend + backend + AI recognition pipeline.

---

# 🧠 Tech Stack

## Frontend
- React.js
- HTML5
- CSS3
- JavaScript

## Backend
- Node.js
- Express.js
- Flask

## AI / Computer Vision
- OpenCV
- LBPH Face Recognizer
- Haar Cascade Face Detection
- NumPy

## Database
- MongoDB
- Mongoose

---

# 🏗️ System Architecture

```text
Frontend (React)
        │
        ▼
Node.js Backend (Express API)
        │
        ├── MongoDB Database
        │
        ▼
Python Face Recognition API (Flask + OpenCV)
