import React, { useEffect, useState } from "react";
import "./AddNewUser.css";
import { useLocation, useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import AddEditForm from "../../Components/ControlPanel/AddEditForm";
import Logout from "../../Components/Login/Logout";
import Button from "../../Components/ControlPanel/Button";

const EditUser = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const params = useParams();

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      // Redirect to login page if user data is not available
      navigate("/");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    fetch("http://localhost:9000/admin/groups", {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("You are not authenticated");
          } else {
            throw new Error("Error fetching data");
          }
        }

        const data = await response.json();
        if (data) {
          setGroups(data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    fetch(`http://localhost:9000/admin/edit-user/${params.id}`, {
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
        setUsername(data.username || "");
        setPassword("");
        setRole(data.role || "User");
        setGroup(data.groupId || "");
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
      username: username,
      password: password ? password : "",
      role: role,
      group: group === '' ? null : group
    };
    try {
      const response = await fetch(
        `http://localhost:9000/admin/update-user/${params.id}`,
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
        navigate("/control-panel-admin/", {
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
      <AddEditForm
        title={username + " تعديل بيانات المستخدم"}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        role={role}
        setRole={setRole}
        groups={groups}
        group ={group}
        setGroup={setGroup}
        handleSubmit={handleSubmit}
        error={error}
      />

    </>
  );
};

export default EditUser;
