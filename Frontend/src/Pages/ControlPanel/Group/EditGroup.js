import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import NavBarList from "../../../Components/CommonComponents/NavBarList";
import AddEditForm from "../../../Components/ControlPanel/AddEditForm";
const EditGroup = () => {
  const [groupName, setGroupName] = useState("");
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
        setGroupName(data.name);
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
        title="تعديل قسم جديد"
        groupName={groupName}
        setGroupName={setGroupName}
        handleSubmit={handleSubmit}
        error={error}
      />
    </>
  );
};

export default EditGroup;
