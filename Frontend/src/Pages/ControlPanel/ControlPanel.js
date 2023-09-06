import React, { useEffect, useState } from 'react'
import "./ControlPanel.css"
import { useNavigate } from 'react-router-dom';
import Table from '../../Components/ControlPanel/Table';
import AdminPanel from '../../Components/ControlPanel/AdminPanel';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
import NavBarList from '../../Components/CommonComponents/NavBarList';
const ControlPanel = () => {
  const [users, setUsers] = useState([])
  const [user, setUser] = useState(null)
  const navigate = useNavigate();
  const token = Cookies.get('user')
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
      navigate("/");
      return;
    }
}, [token, navigate])

useEffect(() => {
  if(user){
    if( user.role !== 'Admin' ){
      navigate("/");
      return;
    }
  }
}, [user, navigate]);
  useEffect(() => {

    fetch("http://128.36.1.71:9000/admin/users", {
      credentials: 'include'
    }).then(response => {
      if (response.ok) {
        return response.json();
      }
    })
      .then(data => setUsers(data))
      .catch(error => {
        console.error(error.message);
      })
  }, [navigate])

  const handleClick = (path) => {

    navigate(path,{
      state : {user : user}
    })
  }


  const handleBack = () => {
      navigate('/')
  }
  const handleEdit = (userID) => {
    navigate(`/control-panel-admin/edit/${userID}`, {
      state: { user: user }
    })
  }


  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        "http://128.36.1.71:9000/admin/delete-user/" + id,
        {
          method: "DELETE",
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete card");
      } else {
        const updatedUsers = users.filter((user) => user.id !== id);
        setUsers(updatedUsers);
      }


      // Remove the deleted card from the state
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  }


  if (!user || (user && user.role !== "Admin") ) {
    return null;
  }
  
  return (
    <>
      <div className='container-body'>

        <AdminPanel>
          <NavBarList user={user} users={users} isHomePage={false} handleBack = {handleBack} handleClick = {handleClick} />
          <Table users={users} groups={null}  handleClick = {handleClick} handleEdit={handleEdit} handleDelete={handleDelete} />
        </AdminPanel>
      </div>
    </>

  )
}

export default ControlPanel