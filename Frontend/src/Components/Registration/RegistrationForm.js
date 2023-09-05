import React, { useEffect, useState } from "react";
import "./RegistrationForm.css";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import Button from "../CommonComponents/Button";

function RegistrationForm() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [selection, setSelection] = useState("");
  const [groups, setGroups] = useState([]);
  const [sameUsername, setSameUserName] = useState(false);
  const navigate = useNavigate();
  const [cookie] = useCookies(["user"]);
  useEffect(() => {
    if (cookie.user) {
      navigate("/");
      return;
    }
  }, [cookie, navigate]);

  useEffect(() => {
    fetch("http://localhost:9000/groups", {
        credentials: 'include'
      }).then(async response => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('You are not authenticated');
          } else {
            throw new Error('Error fetching data');
          }
        }

        const data = await response.json();
        if (data) {
          setGroups(data);
          setSelection(data[0].id + "")
        }
      })
      .catch(error => {
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
    try{
      const response = await fetch(
        `http://localhost:9000/registration/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ data: formData }),
        }
      )
      if (!response.ok) {
        setSameUserName(true);
      } else {
        setSameUserName(false);
        const userData = await response.json();
        navigate("/", {
          state: { user: userData },
        });
      }
    }catch(error){
      console.log(error);
    }

  };
  return (
    <>
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
        تسجيل حساب جديد <i className="fa-solid fa-address-card"></i>
      </div>

      <div className="register-form">
        <form onSubmit={handleSubmit}>
          <label>
            <span>اختيار قسم الموظف :</span>
            <select
              onChange={(event) => setSelection(event.target.value)}
              required
              onInvalid={e => e.target.setCustomValidity('برجاء اختيار القسم')}
            >
              {groups?.map((element) => {
                return(
                   <option key={element.id} value={element.id}>{element.name}</option>
                )
              })}
            </select>
          </label>
          <label>
            <span>إسم المستخدم:</span>

            <input
              type="text"
              value={username}
              onChange={(event) => setUserName(event.target.value)}
              required
              onInvalid={e => e.target.setCustomValidity('برجاء إدخال إسم المستخدم')}
            />
          </label>

          <label>
            <span>كلمة السر :</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              onInvalid={e => e.target.setCustomValidity('برجاء إدخال كلمة السر')}
            />
          </label>
          <Button type={"submit"} body={"سجل الآن!"}/>
          {sameUsername && (
            <div className="alert alert-danger pop" role="alert">
              هذا المستخدم موجود مسبقاً
            </div>
          )}
          <div>
            هل تملك حسابًا ؟ <Link to="/login">تسجيل الدخول</Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default RegistrationForm;
