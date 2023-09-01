import './App.css';
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './Components/Login/LoginForm';
import RegistrationForm from './Components/Registration/RegistrationForm';
import Home from './Pages/Home/Home';
import NoPage from './Pages/NoPage/NoPage';
import ControlPanel from './Pages/ControlPanel/ControlPanel';
import AddNewUser from './Pages/ControlPanel/AddNewUser';
import EditUser from './Pages/ControlPanel/EditUser';
import { CookiesProvider } from 'react-cookie';
import Groups from './Pages/ControlPanel/Groups';
import AddGroup from './Pages/ControlPanel/AddGroup';
import EditGroup from './Pages/ControlPanel/EditGroup';
function App() {

  return (
    <>
      <CookiesProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<RegistrationForm />}/>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/control-panel-admin" element={<ControlPanel />}/>
              <Route path="/control-panel-admin/groups" element={<Groups />}/>
              <Route path="/control-panel-admin/groups/add" element={<AddGroup />} />
              <Route path="/control-panel-admin/groups/edit/:id" element={<EditGroup />}/>
              <Route path="/control-panel-admin/add" element={<AddNewUser />} />
              <Route path="/control-panel-admin/edit/:id" element={<EditUser />} />
              <Route path="*" element={<NoPage />} />
            </Routes>
          </Router>
      </CookiesProvider>
    </>
  );
}
 
export default App;
