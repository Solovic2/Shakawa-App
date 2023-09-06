import React from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import Button from "../../Components/CommonComponents/Button";
const Logout = () => {
  const [, , removeCookie] = useCookies(["user"]);
  const navigate = useNavigate();

  const handleLogout = async (event) => {
    event.preventDefault();
    const response = await fetch("/logout");
    if (response.ok) {
      removeCookie("user", { path: "/" });

      navigate("/login"); // Redirect to the login page after logging out
    } else {
      console.error("Error logging out:", response.statusText);
    }
  };

  return (
    <div className="logout">
      <Button
        className={"btn btn-danger"}
        handleClick={handleLogout}
        body={"تسجيل الخروج"}
      />
    </div>
  );
};

export default Logout;
