import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import RegisterRider from './pages/RegisterRider.jsx';
import RegisterVehicle from './pages/RegisterVehicle.jsx';
import DashboardRider from './pages/DashboardRider.jsx';
import DashboardDriver from './pages/DashboardDriver.jsx';
import ProfileView from './pages/ProfileView.jsx';
import ProfileEdit from './pages/ProfileEdit.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterRider />} />
        <Route path="/register/vehicle" element={<RegisterVehicle />} />
        <Route path="/dashboard/rider" element={<DashboardRider />} />
        <Route path="/dashboard/driver" element={<DashboardDriver />} />
        <Route path="/profile/view" element={<ProfileView />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
      </Routes>
    </Router>
  );
}

export default App;