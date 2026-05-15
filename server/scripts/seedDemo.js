/**
 * Seed demo admin, teacher, and student accounts.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config/env');
const { User, Admin, Teacher, Student, Department, Class } = require('../models');

const DEMO_PASSWORD = 'demo123';

const DEMO_USERS = [
  {
    username: 'demo_admin',
    email: 'admin@demo.com',
    role: 'admin',
    profile: { type: 'admin', name: 'Demo Admin' },
  },
  {
    username: 'demo_teacher',
    email: 'teacher@demo.com',
    role: 'teacher',
    profile: {
      type: 'teacher',
      name: 'Demo Teacher',
      employeeId: 'TCH-DEMO-001',
      phone: '9876543210',
    },
  },
  {
    username: 'demo_student',
    email: 'student@demo.com',
    role: 'student',
    profile: {
      type: 'student',
      name: 'Demo Student',
      usn: '1CR20CS001',
      age: '20',
      course: 'Computer Science',
      phone: '9876543211',
    },
  },
];

async function upsertUser({ username, email, role, profile }) {
  let user = await User.findOne({ email });
  if (user) {
    user.username = username;
    user.password = DEMO_PASSWORD;
    user.role = role;
    user.isActive = true;
    await user.save();
    console.log(`  Updated user: ${email}`);
  } else {
    user = await User.create({
      username,
      email,
      password: DEMO_PASSWORD,
      role,
      isActive: true,
    });
    console.log(`  Created user: ${email}`);
  }

  if (profile.type === 'admin') {
    await Admin.findOneAndUpdate(
      { user: user._id },
      { user: user._id, name: profile.name },
      { upsert: true, new: true }
    );
  }

  if (profile.type === 'teacher') {
    const dept = await Department.findOne({ code: 'CSE' });
    await Teacher.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        name: profile.name,
        employeeId: profile.employeeId,
        phone: profile.phone,
        department: dept?._id,
      },
      { upsert: true, new: true }
    );
  }

  if (profile.type === 'student') {
    const dept = await Department.findOne({ code: 'CSE' });
    await Student.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        name: profile.name,
        usn: profile.usn,
        age: profile.age,
        course: profile.course,
        phone: profile.phone,
        department: dept?._id,
        enrollmentApproved: true,
        faceEnrolled: false,
      },
      { upsert: true, new: true }
    );
  }

  return user;
}

async function seed() {
  await mongoose.connect(config.mongoURI);
  console.log('Connected to MongoDB\n');

  const dept = await Department.findOneAndUpdate(
    { code: 'CSE' },
    {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Demo department',
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log('Department:', dept.code);

  for (const demo of DEMO_USERS) {
    await upsertUser(demo);
  }

  const teacherProfile = await Teacher.findOne()
    .populate('user')
    .then((t) => t || Teacher.findOne({ employeeId: 'TCH-DEMO-001' }));

  const demoClass = await Class.findOneAndUpdate(
    { code: 'CSE-A' },
    {
      name: 'CSE Section A',
      code: 'CSE-A',
      subject: 'Computer Science',
      department: dept._id,
      teacher: teacherProfile?._id,
      semester: '6',
      academicYear: '2025-26',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  const student = await Student.findOne({ usn: '1CR20CS001' });
  if (student && !demoClass.students.includes(student._id)) {
    demoClass.students.push(student._id);
    await demoClass.save();
  }

  if (teacherProfile && !teacherProfile.assignedClasses.includes(demoClass._id)) {
    teacherProfile.assignedClasses.push(demoClass._id);
    await teacherProfile.save();
  }

  console.log('\n--- Demo accounts ready ---\n');
  console.log('Password for all accounts: demo123\n');
  console.log('| Role    | Email             | Login URL   |');
  console.log('|---------|-------------------|-------------|');
  console.log('| Admin   | admin@demo.com    | /admin      |');
  console.log('| Teacher | teacher@demo.com  | /teacher    |');
  console.log('| Student | student@demo.com  | /student    |');
  console.log('\nSign in at: http://localhost:5173/signin\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
