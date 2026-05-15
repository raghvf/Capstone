import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaClipboardCheck } from 'react-icons/fa';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import api from '../../api/client';

export default function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/overview'),
      api.get('/api/attendance/analytics'),
    ]).then(([o, a]) => {
      setOverview(o.data);
      setAnalytics(a.data);
    }).catch(console.error);
  }, []);

  const chartData = [
    { name: 'Present', value: overview?.presentToday || 0, fill: '#10b981' },
    { name: 'Absent', value: Math.max(0, (overview?.totalStudents || 0) - (overview?.presentToday || 0)), fill: '#f43f5e' },
  ];

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="System Overview"
        subtitle="Campus-wide statistics and attendance at a glance"
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Students" value={overview?.totalStudents ?? '—'} color="blue" icon={FaUserGraduate} />
        <StatCard title="Teachers" value={overview?.totalTeachers ?? '—'} color="green" icon={FaChalkboardTeacher} />
        <StatCard title="Classes" value={overview?.totalClasses ?? '—'} color="violet" icon={FaBook} />
        <StatCard title="Present Today" value={overview?.presentToday ?? '—'} subtitle={`${overview?.attendanceRate ?? 0}% attendance`} color="amber" icon={FaClipboardCheck} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Today's Attendance" subtitle="Present vs absent">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Pending Actions">
          <ul className="space-y-4">
            {[
              { label: 'Pending enrollments', value: overview?.pendingEnrollments ?? 0, warn: true },
              { label: 'Departments', value: overview?.totalDepartments ?? 0 },
              { label: 'Daily attendance logs', value: analytics?.dailyLogs?.length ?? 0 },
            ].map(({ label, value, warn }) => (
              <li key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">{label}</span>
                <span className={`text-lg font-bold ${warn && value > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
