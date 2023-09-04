import './Home.css';
import React, { useEffect, useState } from 'react'
import FilterBox from '../../Components/FilterBox/FilterBox';
import NotificationBar from '../../Components/NotificationBar/NotificationBar';
import { useNavigate } from 'react-router-dom';
import NavBarList from '../../Components/NavBar/NavBarList';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
function Home() {
  const [notifyAddDelete, setNotifyAddDelete] = useState(0);
  const [notifyCountFlag, setNotifyCountFlag] = useState(0);
  const [prevNotifyAddDelete, setPrevNotifyAddDelete] = useState(null);
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
  
  // Notify when delete and added at same time 
  // useEffect(() => {
  //   setPrevNotifyAddDelete(notifyAddDelete);
  // }, [notifyAddDelete]);

  // useEffect(() => {
  //   if (prevNotifyAddDelete === 1 && notifyAddDelete === 2) {
  //     console.log("???");
  //     setNotifyAddDelete(4);
  //     setNotifyCountFlag(prev => prev + 1)
  //     setPrevNotifyAddDelete(null);
  //   }
  // }, [notifyAddDelete, prevNotifyAddDelete]);
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
        <NavBarList user = {user} handleClick={handleClick}/>
        <NotificationBar flag = {notifyAddDelete} notifyFlag = {notifyCountFlag}/>
        <FilterBox user = {user} notify = {notify}/>
      </div>
    </>
  );
}
 
export default React.memo(Home);
