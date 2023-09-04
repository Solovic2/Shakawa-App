import React from "react";
import Logout from "../Login/Logout";
import Button from "../ControlPanel/Button";
import "./NavBarList.css";
const NavBarList = ({ user, handleClick }) => {
  let userRole = "مدير";
  switch (user.role) {
    case "Admin":
      userRole = "الأدمن";
      break;
    case "Manager":
      userRole = "مدير";
      break;
    default:
      userRole = "مدير";
      break;
  }
  return (
    <>
      <ul className="NavList">
        <li>
          <Logout />
        </li>
        {user && user.role === "Admin" && (
          <li>
            <Button
              className="btn btn-primary"
              handleClick={handleClick}
              body="لوحة التحكم "
            />
          </li>
        )}
        <li className="nav-title">
          <img
            src={process.env.PUBLIC_URL + "/title.png"}
            className="img-responsive"
            alt="title"
          />
          <div className="header">
            <span className="badge bg-secondary">
              {user.group ? user.group.name : userRole}
            </span>
          </div>
        </li>
        <li className="logo">
          <img
            src={process.env.PUBLIC_URL + "/logo.png"}
            className="img-responsive"
            alt="logo"
          />
        </li>
      </ul>
    </>
  );
};

export default NavBarList;
