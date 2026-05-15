import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FaCamera, FaCheckCircle } from 'react-icons/fa';
import { FACE_API_URL } from '../api/client';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function FaceCapture({ onRecognized, mode = 'period', classId }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => toast.error('Camera access denied'));
    return () => {
      videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  };

  const handleRecognize = async () => {
    setScanning(true);
    const image = capture();
    try {
      const faceRes = await axios.post(`${FACE_API_URL}/recognize`, { image });
      const { usn, confidence, status } = faceRes.data;

      if (status === 'unknown' || usn === 'Unknown' || usn === 'No face detected') {
        toast.error(`Not recognized (confidence: ${confidence?.toFixed?.(1) ?? 'N/A'})`);
        onRecognized?.({ usn, confidence, success: false });
        return;
      }

      if (classId) {
        const res = await api.post('/api/attendance/face', { image, classId, mode });
        toast.success(`Attendance recorded for ${res.data.student?.name || usn}`);
        onRecognized?.({ ...res.data, success: true });
      } else {
        const res = await api.post(
          mode === 'daily' ? '/api/attendance/daily' : '/api/periodwise-attendance',
          { usn }
        );
        toast.success(res.data.message);
        onRecognized?.({ usn, confidence, success: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Recognition failed');
      onRecognized?.({ success: false });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="card overflow-hidden p-0">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
        <h3 className="flex items-center gap-2 font-semibold text-slate-800">
          <FaCamera className="text-brand-600" />
          Face Scanner
        </h3>
        <p className="text-xs text-slate-500">Position your face in the frame</p>
      </div>
      <div className="relative bg-slate-900 p-4">
        <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full rounded-xl object-cover ring-2 ring-slate-700" />
        <div className="pointer-events-none absolute inset-4 flex items-center justify-center">
          <div className="h-48 w-48 rounded-full border-2 border-dashed border-white/30" />
        </div>
        <canvas ref={canvasRef} width={640} height={480} className="hidden" />
      </div>
      <div className="p-4">
        <button
          type="button"
          onClick={handleRecognize}
          disabled={scanning}
          className="btn-primary w-full py-3 disabled:cursor-not-allowed"
        >
          {scanning ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Scanning…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FaCheckCircle />
              Capture &amp; Mark Attendance
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
