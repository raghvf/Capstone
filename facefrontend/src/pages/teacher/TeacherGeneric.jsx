import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import api from '../../api/client';

export function TeacherListPage({ title, endpoint, fields, canCreate, createPayload }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', content: '' });

  const load = () => api.get(endpoint).then((r) => setItems(r.data)).catch(console.error);
  useEffect(() => { load(); }, [endpoint]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post(endpoint, createPayload ? createPayload(form) : form);
      toast.success('Created');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <DashboardLayout role="teacher">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{title}</h1>
      {canCreate && (
        <form onSubmit={create} className="mb-6 space-y-2 rounded-xl bg-white p-4 shadow-sm">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded border px-3 py-2" required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded border px-3 py-2" rows={2} />
          {form.dueDate !== undefined && <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="rounded border px-3 py-2" />}
          <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded border px-3 py-2" rows={2} />
          <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-white">Post</button>
        </form>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="rounded-xl bg-white p-4 shadow-sm">
            {fields.map((f) => (
              <p key={f} className="text-sm"><span className="font-medium capitalize">{f}: </span>{item[f] || item.class?.name || '—'}</p>
            ))}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  useEffect(() => { api.get('/api/teachers/my-classes').then((r) => setClasses(r.data)); }, []);
  return (
    <DashboardLayout role="teacher">
      <h1 className="mb-6 text-2xl font-bold">My Classes</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {classes.map((c) => (
          <div key={c._id} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="font-bold">{c.name}</p>
            <p className="text-sm text-slate-500">{c.subject}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export const TeacherAssignments = () => (
  <TeacherListPage title="Assignments" endpoint="/api/assignments" fields={['title', 'dueDate']} canCreate createPayload={(f) => ({ title: f.title, description: f.description, dueDate: f.dueDate, class: f.classId })} />
);
export const TeacherAnnouncements = () => (
  <TeacherListPage title="Announcements" endpoint="/api/announcements" fields={['title', 'content']} canCreate createPayload={(f) => ({ title: f.title, content: f.content || f.description })} />
);
export const TeacherReports = () => {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => { api.get('/api/attendance/analytics').then((r) => setAnalytics(r.data)); }, []);
  return (
    <DashboardLayout role="teacher">
      <h1 className="mb-6 text-2xl font-bold">Attendance Reports</h1>
      <p className="text-slate-600">Present today: {analytics?.presentToday ?? 0} / {analytics?.totalStudents ?? 0}</p>
    </DashboardLayout>
  );
};
