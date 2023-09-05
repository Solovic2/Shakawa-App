import React, { useEffect, useState } from "react";
import "./AddNewUser.css";
import { useLocation, useNavigate, useParams } from "react-router";
import Logout from "../../Components/Login/Logout";
import Button from "../../Components/CommonComponents/Button";
import AddEditGroup from "../../Components/ControlPanel/AddEditGroup";
const EditGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const params = useParams()
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      // Redirect to login page if user data is not available
      navigate("/");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    fetch(`http://localhost:9000/admin/edit-group/${params.id}`, {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          // The response status is in the 2xx range, so the request was successful
          return response.json();
        } else if (response.status === 401) {
          // The user is not authenticated, display error message
          // throw new Error('You are not authenticated');
          throw new Error("You are not authenticated");
        } else {
          // The response status is not in the 2xx or 401 range, display error message
          throw new Error("An error occurred while fetching data");
        }
      })
      .then((data) => {
        setGroupName(data.name)
      })
      .catch(async (error) => {
        setError(error.message);
      });
  }, [params]);
  if (!user || user.role !== "Admin") {
    return null;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: groupName,
    };
    try {
        const response = await fetch(
          `http://localhost:9000/admin/update-group/${params.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ data }),
          }
        );
  
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
            title="تعديل قسم جديد"
            groupName = {groupName}
            setGroupName = {setGroupName}
            handleSubmit={handleSubmit}
            error={error}
        />
    </>
  );
};

export default EditGroup;
