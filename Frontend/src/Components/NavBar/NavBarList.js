import React from 'react'
import Logout from '../Login/Logout'
import Button from '../ControlPanel/Button'
import "./NavBarList.css"
const NavBarList = ({user, handleClick}) => {
  return (
    <>
        <ul className="NavList">
            <li><Logout/></li>
            {user && user.role === "Admin" && 
                (
                    <li><Button className = "btn btn-primary" handleClick = {handleClick} body = "لوحة التحكم "/></li>
                )
            }
            <li className='nav-title'>
              <img src={process.env.PUBLIC_URL + '/title.png'} className="img-responsive" alt="title"/>
            </li>
            <li className='logo'>
              <img src={process.env.PUBLIC_URL + '/logo.png'} className="img-responsive" alt="logo"/>
            </li>
        </ul>
    </>
  )
}

export default NavBarList