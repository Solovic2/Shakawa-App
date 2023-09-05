import React, { useState, useEffect } from "react";
import "./LoginForm.css";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import Button from "../CommonComponents/Button";
function LoginForm() {
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
    const response = await fetch(`http://localhost:9000/registration/login`, {
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
      <div className="login">
        <div className="cover">
          <img
            src={process.env.PUBLIC_URL + "/banner.png"}
            className="img-responsive "
            alt="banner"
          />
          <div>
            <img
              src={process.env.PUBLIC_URL + "/title.png"}
              className="banner-title img-responsive "
              alt="title"
            />
          </div>
        </div>
        <div className="title">
          تسجيل الدخول <i className="fa-solid fa-right-to-bracket"></i>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            إسم المستخدم:
            <input
              type="text"
              value={username}
              onChange={(event) => setUserName(event.target.value)}
              required
              onInvalid={(e) =>
                e.target.setCustomValidity("برجاء إدخال إسم المستخدم")
              }
            />
          </label>
          <label>
            كلمة السر:
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              onInvalid={(e) =>
                e.target.setCustomValidity("برجاء إدخال كلمة السر")
              }
            />
          </label>
          <Button type={"submit"} body={"تسجيل الدخول"} />
          {error && (
            <div className="alert alert-danger pop" role="alert">
              {error}
            </div>
          )}
          <div>
            لا تملك حسابًا وتريد بعمل حساب جديد؟{" "}
            <Link to="/register">التسجيل</Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default LoginForm;
