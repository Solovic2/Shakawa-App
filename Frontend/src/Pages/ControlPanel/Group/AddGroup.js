import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import NavBarList from "../../../Components/CommonComponents/NavBarList";
import AddEditForm from "../../../Components/ControlPanel/AddEditForm";
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
      const response = await fetch(`http://128.36.1.71:9000/admin/addGroup`, {
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
        isUser={false}
        title="إضافة قسم جديد"
        groupName={groupName}
        setGroupName={setGroupName}
        handleSubmit={handleSubmit}
        error={error}
      />
    </>
  );
};

export default AddGroup;
