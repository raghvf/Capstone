import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import api from '../../api/client';

export default function StudentAttendance() {
  const [stats, setStats] = useState(null);
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    api.get('/api/attendance/my-stats').then((r) => setStats(r.data)).catch(console.error);
  }, []);

  const requestCorrection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/attendance/corrections', { date, reason, period: 'General' });
      toast.success('Correction request submitted');
      setReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <DashboardLayout role="student">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">My Attendance</h1>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Daily Logs</h2>
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {(stats?.dailyLogs || []).map((l) => (
              <li key={l._id} className="flex justify-between rounded bg-slate-50 px-3 py-2">
                <span>{new Date(l.recognizedAt).toLocaleDateString()}</span>
                <span className="text-green-600">{l.status}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Period Logs</h2>
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {(stats?.periodLogs || []).map((l) => (
              <li key={l._id} className="flex justify-between rounded bg-slate-50 px-3 py-2">
                <span>{l.period}</span>
                <span>{new Date(l.recognizedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <form onSubmit={requestCorrection} className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Request Attendance Correction</h2>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mb-3 w-full rounded border px-3 py-2" required />
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="mb-3 w-full rounded border px-3 py-2" rows={3} required />
        <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-700">Submit Request</button>
      </form>
    </DashboardLayout>
  );
}
