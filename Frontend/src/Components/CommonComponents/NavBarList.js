import React from "react";
import Logout from "../../Pages/Registration/Logout";
import Button from "./Button";
import "./NavBarList.css";
const NavBarList = ({
  user,
  users,
  isHomePage,
  isAddEdit,
  handleBack,
  handleBackToControlPanel,
  handleClick,
}) => {
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
        {user && user.role === "Admin" && isHomePage && (
          <li>
            <Button
              className="btn btn-primary"
              handleClick={handleClick}
              body="لوحة التحكم "
            />
          </li>
        )}
        {!isHomePage && (
          <>
            {isAddEdit ? (
              <>
                <li>
                  <Button
                    handleClick={handleBack}
                    className="btn btn-primary"
                    body="العودة للصفحة الرئيسية"
                  />
                </li>
                <li>
                  <Button
                    handleClick={handleBackToControlPanel}
                    className="btn btn-primary"
                    body="العودة للوحة التحكم"
                  />
                </li>
              </>
            ) : (
              <>
                <li>
                  <Button
                    handleClick={handleBack}
                    className="btn btn-primary"
                    body="العودة للصفحة الرئيسية"
                  />
                </li>
                {users ? (
                  <li>
                    <Button
                      handleClick={() =>
                        handleClick("/control-panel-admin/groups")
                      }
                      className="btn btn-primary"
                      body="الأقسام"
                    />
                  </li>
                ) : (
                  <li>
                    <Button
                      handleClick={() => handleClick("/control-panel-admin/")}
                      className="btn btn-primary"
                      body="المستخدمين"
                    />
                  </li>
                )}
              </>
            )}
          </>
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
