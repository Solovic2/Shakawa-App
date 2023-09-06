import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import AddEditForm from "../../../Components/ControlPanel/AddEditForm";
import NavBarList from "../../../Components/CommonComponents/NavBarList";
const AddNewUser = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState("");
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

  useEffect(() => {
    fetch("http://128.36.1.71:9000/admin/groups", {
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

  if (!user || user.role !== "Admin") {
    return null;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      username: username,
      password: password,
      role: role,
      group: group === "" ? null : group,
    };
    try {
      const response = await fetch(`http://128.36.1.71:9000/admin/addUser`, {
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
    navigate("/control-panel-admin", {
      state: { user: user },
    });
  };
  return (
    <>
      <NavBarList
        user={user}
        isAddEdit={true}
        isHomePage={false}
        handleBack={handleBackToHome}
        handleBackToControlPanel={handleBackToControlPanel}
      />

      <AddEditForm
        isUser={true}
        title="إضافة مستخدم جديد"
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        role={role}
        setRole={setRole}
        groups={groups}
        group={group}
        setGroup={setGroup}
        handleSubmit={handleSubmit}
        error={error}
      />
    </>
  );
};

export default AddNewUser;
