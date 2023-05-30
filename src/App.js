import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import  {Login}  from './Login';
import Registration from './Register';

import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './components/Home';
import EmployeeList from './components/pages/Employees/EmployeeList';
import ProjectList from './components/pages/Projects/ProjectList';
import AttendanceList from './components/pages/Attendances/AttendanceList';



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // if (!isLoggedIn) {
  //   return <Login onLogin={() => setIsLoggedIn(true)} />;
  // }
  // return (
  //   <div>
  //     <Dashboard />

  //   </div>

  // );
  console.log(isLoggedIn);
  return (
    <Routes>

      <Route path="/" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />

      <Route path="/register" element={<Registration />} />
      
      
      <Route path="/" element={<Dashboard />} >
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/employees" element={<EmployeeList />} />
      <Route path="/projects" element={<ProjectList />} />

      <Route path="/attendances" element={<AttendanceList />} />
      </Route>

    </Routes>
  );


}

export default App;





