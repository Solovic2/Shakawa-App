import React from "react";
import Button from "../../Components/ControlPanel/Button";
import Logout from "../../Components/Login/Logout";

const AddUser = (props) => {
  return (
    <>
        <ul className="NavList">
          <li>
            <Logout />
          </li>
          <li>
            <Button
              handleClick={props.handleBack}
              className="btn btn-primary"
              body="العودة للصفحة الرئيسية"
            />
          </li>
          <li>
            <Button
              handleClick={props.handleClick}
              className="btn btn-primary add-new-member"
              body="إضافة مستخدم جديد"
            />
          </li>
          <li className="nav-title">
            <img
              src={process.env.PUBLIC_URL + "/title.png"}
              className="img-responsive"
              alt="title"
            />
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

export default AddUser;
