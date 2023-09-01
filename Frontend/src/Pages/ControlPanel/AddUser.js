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
        {props.users ? (
          <li>
            <Button
              handleClick={() =>
                props.handleClick("/control-panel-admin/groups")
              }
              className="btn btn-primary"
              body="الأقسام"
            />
          </li>
        ) : (
          <li>
            <Button
              handleClick={() => props.handleClick("/control-panel-admin/")}
              className="btn btn-primary"
              body="المستخدمين"
            />
          </li>
        )}
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
