import React, { useEffect, useState } from 'react'
import "./ControlPanel.css"
import { useNavigate } from 'react-router-dom';
import Table from '../../Components/ControlPanel/Table';
import AddUser from './AddUser';
import AdminPanel from '../../Components/ControlPanel/AdminPanel';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
const Groups = () => {
  const [groups, setGroups] = useState([])
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

    fetch("http://localhost:9000/admin/groups", {
      credentials: 'include'
    }).then(response => {
      if (response.ok) {
        return response.json();
      }
    })
      .then(data => setGroups(data))
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
  const handleEdit = (groupID) => {
    navigate(`/control-panel-admin/groups/edit/${groupID}`, {
      state: { user: user }
    })
  }


  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        "http://localhost:9000/admin/delete-group/" + id,
        {
          method: "DELETE",
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete card");
      } else {
        const updatedGroups = groups.filter((group) => group.id !== id);
        setGroups(updatedGroups);
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
          <AddUser users ={null} handleBack = {handleBack} handleClick = {handleClick} />
          <Table users={null} groups={groups}  handleClick = {handleClick}  handleEdit={handleEdit} handleDelete={handleDelete} />
        </AdminPanel>
      </div>
    </>

  )
}

export default Groups