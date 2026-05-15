import { useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import FaceCapture from '../../components/FaceCapture';

export default function TeacherAttendance() {
  const [results, setResults] = useState([]);

  return (
    <DashboardLayout role="teacher">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Take Attendance</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <FaceCapture
          mode="period"
          onRecognized={(r) => r.success && setResults((prev) => [r, ...prev].slice(0, 10))}
        />
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Recent Recognitions</h2>
          {results.length === 0 ? (
            <p className="text-sm text-slate-500">No attendance recorded this session.</p>
          ) : (
            <ul className="space-y-2">
              {results.map((r, i) => (
                <li key={i} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  {r.student?.name || r.usn} — confidence: {r.confidence?.toFixed?.(1)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
