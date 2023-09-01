import React, { useEffect, useState } from "react";
import "./AddNewUser.css";
import { useLocation, useNavigate } from "react-router";
import Logout from "../../Components/Login/Logout";
import Button from "../../Components/ControlPanel/Button";
import AddEditGroup from "../../Components/ControlPanel/AddEditGroup";
const AddGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      // Redirect to login page if user data is not available
      navigate("/");
      return;
    }
  }, [user, navigate]);

  
  if (!user || user.role !== "Admin") {
    return null;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: groupName,
    };
    try {
      const response = await fetch(`http://localhost:9000/admin/addGroup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
      } else {
        navigate("/control-panel-admin/groups", {
          state: { user: user },
        });
      }
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };
  const handleBackToHome = () => {
    navigate("/");
  };
  const handleBackToControlPanel = () => {
    navigate('/control-panel-admin', {
      state: { user: user }
    })
  };
  return (
    <>
      <div className="navbar-buttons">
        <ul className="NavList">
          <li>
            <Logout />
          </li>
          <li>
            <Button
              handleClick={handleBackToHome}
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
      </div>

        <AddEditGroup
            title="إضافة قسم جديد"
            groupName = {groupName}
            setGroupName = {setGroupName}
            handleSubmit={handleSubmit}
            error={error}
        />
    </>
  );
};

export default AddGroup;
