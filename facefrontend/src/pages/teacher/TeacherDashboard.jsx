import { useEffect, useState } from 'react';
import { FaBook, FaClipboardList, FaLayerGroup } from 'react-icons/fa';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import api from '../../api/client';

export default function TeacherDashboard() {
  const [classes, setClasses] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/api/teachers/my-classes'),
      api.get('/api/attendance/period'),
    ]).then(([c, l]) => {
      setClasses(c.data);
      setLogs(l.data.slice(0, 10));
    }).catch(console.error);
  }, []);

  return (
    <DashboardLayout role="teacher">
      <PageHeader title="Teacher Dashboard" subtitle="Your classes and recent attendance activity" />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard title="Classes" value={classes.length} color="green" icon={FaBook} />
        <StatCard title="Recent logs" value={logs.length} color="blue" icon={FaClipboardList} />
        <StatCard title="Subjects" value={[...new Set(classes.map((c) => c.subject))].length} color="violet" icon={FaLayerGroup} />
      </div>
      <Card title="My Classes">
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((c) => (
            <div key={c._id} className="card-hover rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-4">
              <p className="font-semibold text-slate-800">{c.name}</p>
              <p className="text-sm text-slate-500">{c.subject} · {c.code}</p>
              <p className="mt-2 text-xs font-medium text-emerald-600">{c.students?.length || 0} students</p>
            </div>
          ))}
          {classes.length === 0 && <p className="col-span-2 py-8 text-center text-slate-400">No classes assigned yet.</p>}
        </div>
      </Card>
    </DashboardLayout>
  );
}
