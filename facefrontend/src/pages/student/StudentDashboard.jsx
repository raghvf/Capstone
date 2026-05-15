import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FaPercent, FaCheckCircle, FaBook } from 'react-icons/fa';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import api from '../../api/client';

const COLORS = ['#8b5cf6', '#e2e8f0'];

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/api/attendance/my-stats').then((r) => setStats(r.data)).catch(console.error);
  }, []);

  const pct = stats?.attendancePercentage ?? 0;
  const pieData = [
    { name: 'Present', value: pct },
    { name: 'Remaining', value: Math.max(0, 100 - pct) },
  ];

  return (
    <DashboardLayout role="student">
      <PageHeader
        title={`Hello, ${stats?.student?.name?.split(' ')[0] || 'Student'}`}
        subtitle={`USN ${stats?.student?.usn || '—'} · ${stats?.student?.course || ''}`}
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard title="Attendance" value={`${pct}%`} color="violet" icon={FaPercent} />
        <StatCard title="Days Present" value={stats?.totalPresent ?? 0} color="green" icon={FaCheckCircle} />
        <StatCard title="Course" value={stats?.student?.course ?? '—'} color="blue" icon={FaBook} />
      </div>
      <Card title="Attendance breakdown">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4}>
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </DashboardLayout>
  );
}
