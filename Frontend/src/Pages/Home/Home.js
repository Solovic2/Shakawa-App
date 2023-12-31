import './Home.css';
import React, { useEffect, useState } from 'react'
import FilterBox from '../../Components/FilterBox/FilterBox';
import NotificationBar from '../../Components/NotificationBar/NotificationBar';
import { useNavigate } from 'react-router-dom';
import NavBarList from '../../Components/CommonComponents/NavBarList';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
function Home() {
  const [notifyAddDelete, setNotifyAddDelete] = useState(0);
  const [notifyCountFlag, setNotifyCountFlag] = useState(0);
  const navigate = useNavigate();
  const token = Cookies.get('user')
  const [user, setUser] = useState(null)
  // Check Authorization
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        setUser(decodedToken);
      } catch (error) {
        console.log('Invalid token:', error);
      }
    } else {
      navigate("/login");
      return;
    }
  }, [token, navigate])
  
  const notify = (value, counterFlag) =>{
    setNotifyAddDelete(value);
    setNotifyCountFlag(counterFlag)
  }


  if (user == null) {
    return null; // Don't render anything if the user is not logged in
  }
  const handleClick = () =>{
    navigate("/control-panel-admin")
  }
  return (
    <>
      <div className='container-body'>
        <NavBarList user = {user} isHomePage={true} handleClick={handleClick}/>
        <NotificationBar flag = {notifyAddDelete} notifyFlag = {notifyCountFlag}/>
        <FilterBox user = {user} notify = {notify}/>
      </div>
    </>
  );
}
 
export default React.memo(Home);
