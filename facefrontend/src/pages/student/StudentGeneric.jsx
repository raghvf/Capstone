import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import api from '../../api/client';

function StudentListPage({ title, endpoint, renderItem }) {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get(endpoint).then((r) => setItems(r.data)).catch(console.error); }, [endpoint]);
  return (
    <DashboardLayout role="student">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{title}</h1>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-slate-500">Nothing here yet.</p>}
        {items.map((item) => (
          <div key={item._id} className="rounded-xl bg-white p-4 shadow-sm">
            {renderItem(item)}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export const StudentSchedule = () => (
  <StudentListPage title="My Schedule" endpoint="/api/schedules/my" renderItem={(s) => (
    <><p className="font-semibold">{s.dayOfWeek} {s.startTime}–{s.endTime}</p><p className="text-sm text-slate-500">{s.class?.name} · {s.period}</p></>
  )} />
);

export const StudentAssignments = () => (
  <StudentListPage title="Assignments" endpoint="/api/assignments" renderItem={(a) => (
    <><p className="font-semibold">{a.title}</p><p className="text-sm text-slate-500">Due: {new Date(a.dueDate).toLocaleDateString()}</p><p className="mt-1 text-sm">{a.description}</p></>
  )} />
);

export const StudentAnnouncements = () => (
  <StudentListPage title="Announcements" endpoint="/api/announcements" renderItem={(a) => (
    <><p className="font-semibold">{a.title}</p><p className="mt-1 text-sm text-slate-600">{a.content}</p></>
  )} />
);

export const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    api.get('/api/students/me').then((r) => { setProfile(r.data); setPhone(r.data.phone || ''); });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/api/students/me', { phone });
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <DashboardLayout role="student">
      <h1 className="mb-6 text-2xl font-bold">My Profile</h1>
      <form onSubmit={save} className="max-w-md rounded-xl bg-white p-6 shadow-sm">
        <p className="mb-2"><strong>Name:</strong> {profile?.name}</p>
        <p className="mb-2"><strong>USN:</strong> {profile?.usn}</p>
        <p className="mb-4"><strong>Course:</strong> {profile?.course}</p>
        <label className="mb-1 block text-sm font-medium">Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mb-4 w-full rounded border px-3 py-2" />
        <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-white">Save</button>
      </form>
    </DashboardLayout>
  );
};
