import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import api from '../../api/client';

export function AdminListPage({ title, endpoint, fields, createFields }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});

  const load = () => api.get(endpoint).then((r) => setItems(r.data)).catch(console.error);
  useEffect(() => { load(); }, [endpoint]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post(endpoint, form);
      toast.success('Created');
      setForm({});
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <DashboardLayout role="admin">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">{title}</h1>
      {createFields && (
        <form onSubmit={create} className="mb-6 flex flex-wrap gap-2 rounded-xl bg-white p-4 shadow-sm">
          {createFields.map((f) => (
            <input
              key={f}
              placeholder={f}
              value={form[f] || ''}
              onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              className="rounded border px-3 py-2 text-sm"
              required
            />
          ))}
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white">Add</button>
        </form>
      )}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>{fields.map((f) => <th key={f} className="px-4 py-3 capitalize">{f}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t">
                {fields.map((f) => (
                  <td key={f} className="px-4 py-3">
                    {typeof item[f] === 'object' ? item[f]?.name || '—' : String(item[f] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export const AdminTeachers = () => (
  <AdminListPage title="Teachers" endpoint="/api/teachers" fields={['name', 'employeeId']} createFields={['name', 'employeeId', 'email', 'password']} />
);
export const AdminDepartments = () => (
  <AdminListPage title="Departments" endpoint="/api/departments" fields={['name', 'code']} createFields={['name', 'code', 'description']} />
);
export const AdminClasses = () => (
  <AdminListPage title="Classes" endpoint="/api/classes" fields={['name', 'code', 'subject']} createFields={['name', 'code', 'subject', 'department']} />
);
export const AdminSchedules = () => (
  <AdminListPage title="Schedules" endpoint="/api/schedules" fields={['dayOfWeek', 'startTime', 'endTime', 'period']} createFields={['dayOfWeek', 'startTime', 'endTime', 'period', 'class']} />
);
export const AdminAttendance = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/api/attendance/daily').then((r) => setLogs(r.data)); }, []);
  return (
    <DashboardLayout role="admin">
      <h1 className="mb-6 text-2xl font-bold">Attendance Analytics</h1>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="px-4 py-3">USN</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Method</th></tr></thead>
          <tbody>{logs.map((l) => (
            <tr key={l._id} className="border-t"><td className="px-4 py-3">{l.usn}</td><td className="px-4 py-3">{l.name}</td><td className="px-4 py-3">{new Date(l.recognizedAt).toLocaleString()}</td><td className="px-4 py-3">{l.method}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};
export const AdminRecognition = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/api/attendance/recognition-logs').then((r) => setLogs(r.data)); }, []);
  return (
    <DashboardLayout role="admin">
      <h1 className="mb-6 text-2xl font-bold">Recognition Logs</h1>
      <div className="space-y-2">
        {logs.map((l) => (
          <div key={l._id} className="rounded-lg bg-white p-3 text-sm shadow-sm">
            {l.status} — {l.usn || 'unknown'} — confidence: {l.confidence?.toFixed?.(1) ?? 'N/A'}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};
