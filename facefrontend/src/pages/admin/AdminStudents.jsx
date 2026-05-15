import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import api from '../../api/client';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);

  const load = () => api.get('/api/students').then((r) => setStudents(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try {
      await api.patch(`/api/students/${id}/approve`);
      toast.success('Enrollment approved');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'usn', label: 'USN', render: (r) => <span className="font-mono text-sm">{r.usn}</span> },
    { key: 'course', label: 'Course' },
    { key: 'faceEnrolled', label: 'Face', render: (r) => (
      <span className={r.faceEnrolled ? 'badge-success' : 'badge-warning'}>
        {r.faceEnrolled ? 'Enrolled' : 'Pending'}
      </span>
    )},
    { key: 'enrollmentApproved', label: 'Status', render: (r) => (
      <span className={r.enrollmentApproved ? 'badge-success' : 'badge-warning'}>
        {r.enrollmentApproved ? 'Approved' : 'Pending'}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (r) => !r.enrollmentApproved && (
      <button type="button" onClick={() => approve(r._id)} className="text-sm font-medium text-brand-600 hover:underline">
        Approve
      </button>
    )},
  ];

  return (
    <DashboardLayout role="admin">
      <PageHeader title="Students" subtitle={`${students.length} enrolled students`} />
      <DataTable columns={columns} rows={students} emptyMessage="No students yet. Enroll via Add Student." />
    </DashboardLayout>
  );
}
