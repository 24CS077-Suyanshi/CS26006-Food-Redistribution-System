import React from 'react';
import { useAuth } from '../context/AuthContext';
import DonorDashboard from './DonorDashboard';
import NGODashboard from './NGODashboard';
import VolunteerDashboard from './VolunteerDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard(props) {
  const { user } = useAuth();

  switch (user?.role) {
    case 'donor':
      return <DonorDashboard {...props} />;
    case 'ngo':
      return <NGODashboard {...props} />;
    case 'volunteer':
      return <VolunteerDashboard {...props} />;
    case 'admin':
      return <AdminDashboard {...props} />;
    default:
      return <DonorDashboard {...props} />; // Fallback
  }
}
