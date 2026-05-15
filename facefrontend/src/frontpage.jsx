import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaCamera, FaSignInAlt, FaGraduationCap } from 'react-icons/fa';
import api, { FACE_API_URL } from './api/client';

function getCurrentPeriod() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  if (hours >= 9 && hours < 10) return 'Java';
  if (hours === 10 && minutes >= 10) return 'Python';
  if (hours === 11 && minutes >= 20) return 'Networking';
  if (hours === 12 && minutes >= 30) return 'AI/ML';
  if (hours === 18 && minutes >= 30) return 'React';
  return 'No Period';
}

export default function Front() {
  const [recognizedName, setRecognizedName] = useState('—');
  const [recognizedStudentName, setRecognizedStudentName] = useState('—');
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const [students, setStudents] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const period = getCurrentPeriod();

  useEffect(() => {
    api.get('/api/students').then((r) => setStudents(r.data)).catch(console.error);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(() => toast.error('Camera access required'));
    return () => videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
  }, []);

  const handleRecognize = async () => {
    setScanning(true);
    const canvas = canvasRef.current;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');

    try {
      const response = await axios.post(`${FACE_API_URL}/recognize`, { image: imageData });
      const usn = response.data.usn;
      setRecognizedName(usn);

      const matchedStudent = students.find((s) => s.usn === usn);
      setRecognizedStudentName(matchedStudent?.name || 'Not found');

      if (!matchedStudent) {
        setAttendanceMessage('USN not enrolled — attendance not recorded.');
        toast.error('Student not found');
        return;
      }
      if (period === 'No Period') {
        setAttendanceMessage('Outside class hours — cannot record.');
        toast.error('No active class period');
        return;
      }

      const res = await api.post('/api/periodwise-attendance', { usn, recognizedAt: new Date().toISOString() });
      toast.success(res.data.message);
      setAttendanceMessage(`${period} attendance recorded successfully.`);
    } catch (err) {
      setRecognizedName('Error');
      setAttendanceMessage(err.response?.data?.message || 'Recognition failed');
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
              <FaGraduationCap />
            </div>
            <div>
              <p className="font-bold">Smart Campus</p>
              <p className="text-xs text-slate-400">Attendance Kiosk</p>
            </div>
          </div>
          <Link to="/signin" className="btn-secondary !border-white/20 !bg-white/10 !text-white hover:!bg-white/20">
            <FaSignInAlt /> Staff Login
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-2 lg:items-center">
        <div className="card overflow-hidden !border-slate-700 !bg-slate-900/50 p-0 backdrop-blur">
          <div className="relative">
            <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-56 w-56 rounded-full border-2 border-dashed border-indigo-400/50" />
            </div>
          </div>
          <canvas ref={canvasRef} width={640} height={480} className="hidden" />
        </div>

        <div className="text-white">
          <span className={`badge mb-4 ${period === 'No Period' ? 'badge-warning' : 'badge-success'}`}>
            Current period: {period}
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Face Recognition
            <span className="mt-1 block text-indigo-300">Attendance</span>
          </h1>
          <p className="mt-4 text-slate-400">Look at the camera and tap recognize to mark your attendance.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">USN</p>
              <p className="mt-1 text-xl font-bold text-emerald-400">{recognizedName}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Name</p>
              <p className="mt-1 text-xl font-bold text-emerald-400">{recognizedStudentName}</p>
            </div>
          </div>

          {attendanceMessage && (
            <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {attendanceMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleRecognize}
            disabled={scanning}
            className="btn-primary mt-8 w-full py-4 text-base sm:w-auto sm:px-10"
          >
            <FaCamera />
            {scanning ? 'Recognizing…' : 'Recognize Face'}
          </button>
        </div>
      </main>
    </div>
  );
}
