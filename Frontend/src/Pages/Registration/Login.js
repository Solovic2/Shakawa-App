import React, { useState, useEffect } from "react";
import RegistrationForm from '../../Components/Registration/RegistrationForm'
import "../../Components/Registration/RegistrationForm.css";
import {  useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
const Login = () => {
    const navigate = useNavigate();
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [cookie] = useCookies(["user"]);
    useEffect(() => {
      if (cookie.user) {
        navigate("/");
        return;
      }
    }, [cookie, navigate]);
  
    if (cookie.user) {
      return null;
    }
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      const formData = {
        username: username,
        password: password,
      };
      const response = await fetch(`http://128.36.1.71:9000/registration/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ data: formData }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
      } else {
        const userData = await response.json();
        navigate("/", {
          state: { user: userData },
        });
      }
    };
  return (
    <>
    <RegistrationForm
        title={"تسجيل الدخول "}
        handleSubmit={handleSubmit}
        isLogin={true}
        username={username}
        setUserName={setUserName}
        password={password}
        setPassword={setPassword}
        error={error}
      />
    </>
  )
}

export default Login