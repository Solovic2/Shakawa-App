import React, { useEffect, useState } from "react";
import "../../Components/Registration/RegistrationForm.css";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import RegistrationForm from "../../Components/Registration/RegistrationForm";

const Register = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [selection, setSelection] = useState("");
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [cookie] = useCookies(["user"]);
  useEffect(() => {
    if (cookie.user) {
      navigate("/");
      return;
    }
  }, [cookie, navigate]);

  useEffect(() => {
    fetch("http://128.36.1.71:9000/groups", {
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
          setSelection(data[0].id + "");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  if (cookie.user) {
    return null;
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Handle registration submission here
    const formData = {
      username: username,
      password: password,
      role: "User",
      group: selection,
    };
    try {
      const response = await fetch(
        `http://128.36.1.71:9000/registration/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ data: formData }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
      } else {
        const userData = await response.json();
        navigate("/", {
          state: { user: userData },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <RegistrationForm
        title={"تسجيل حساب جديد "}
        handleSubmit={handleSubmit}
        isLogin={false}
        setSelection={setSelection}
        groups={groups}
        username={username}
        setUserName={setUserName}
        password={password}
        setPassword={setPassword}
        error={error}
      />
    </>
  );
};

export default Register;
