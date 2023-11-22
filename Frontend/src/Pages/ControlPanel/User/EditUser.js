import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import AddEditForm from "../../../Components/ControlPanel/AddEditForm";
import NavBarList from "../../../Components/CommonComponents/NavBarList";
const APP_API_URL = process.env.REACT_APP_API_URL;

const EditUser = () => {
  const [username, setUsername] = useState("");
  const [oldUsername, setOldUsername] = useState("");
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
    fetch(`${APP_API_URL}admin/groups`, {
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
    fetch(`${APP_API_URL}admin/edit-user/${params.id}`, {
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
        setOldUsername(data.username || "");
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
      oldUsername: oldUsername,
      username: username,
      password: password ? password : "",
      role: role,
      group: group === "" ? null : group,
    };
    try {
      const response = await fetch(
        `${APP_API_URL}admin/update-user/${params.id}`,
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
        title={username + " تعديل بيانات المستخدم"}
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

export default EditUser;
