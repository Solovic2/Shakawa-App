import React from "react";
import Button from "../CommonComponents/Button";
import { Link } from "react-router-dom";
const RegistrationForm = (props) => {
  return (
    <>
    <div className="registration-form">
      <div className="cover">
        <img
          src={process.env.PUBLIC_URL + "/banner.png"}
          className="img-responsive "
          alt="banner"
        />
        {/* <div>
          <img
            src={process.env.PUBLIC_URL + "/title.png"}
            className="banner-title img-responsive "
            alt="title"
          />
        </div> */}
      </div>
      <div className="title">
        {props.title}
        <i className="fa-solid fa-right-to-bracket"></i>
      </div>
      <form  onSubmit={props.handleSubmit}>
        {!props.isLogin && (
          <label>
            <span>اختيار قسم الموظف :</span>
            <select
              onChange={(event) => props.setSelection(event.target.value)}
              required
              onInvalid={(e) =>
                e.target.setCustomValidity("برجاء اختيار القسم")
              }
              onInput={(e) => {
                e.target.setCustomValidity('');
              }}
            >
              {props.groups?.map((element) => {
                return (
                  <option key={element.id} value={element.id}>
                    {element.name}
                  </option>
                );
              })}
            </select>
          </label>
        )}
        <label>
          إسم المستخدم:
          <input
            type="text"
            value={props.username}
            onChange={(event) => props.setUserName(event.target.value)}
            required
            onInvalid={(e) =>
              e.target.setCustomValidity("برجاء إدخال إسم المستخدم")
            }
            onInput={(e) => {
              e.target.setCustomValidity('');
            }}
          />
        </label>
        <label>
          كلمة السر:
          <input
            type="password"
            value={props.password}
            onChange={(event) => props.setPassword(event.target.value)}
            required
            onInvalid={(e) =>
              e.target.setCustomValidity("برجاء إدخال كلمة السر")
            }
            onInput={(e) => {
              e.target.setCustomValidity('');
            }}
          />
        </label>
        <Button
          type={"submit"}
          body={props.isLogin ? "تسجيل الدخول" : "سجل الآن!"}
        />
        {props.error && (
          <div className="alert alert-danger pop" role="alert">
            {props.error}
          </div>
        )}
        <div>
          {!props.isLogin ? (
            <>
              هل تملك حسابًا ؟ <Link to="/login">تسجيل الدخول</Link>
            </>
          ) : (
            <>
              لا تملك حسابًا وتريد بعمل حساب جديد؟{" "}
              <Link to="/register">التسجيل</Link>
            </>
          )}
        </div>
      </form>
      </div>
    </>
  );
};

export default RegistrationForm;
