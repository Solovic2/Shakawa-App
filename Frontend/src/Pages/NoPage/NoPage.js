import React from "react";
import "./NoPage.css";
import { Link } from "react-router-dom";
const NoPage = () => {
  return (
    <div className="pageNotFound">
      <div className="wrapper">
        <div className="container">
          <div className="grid-row">
            <div className="colmun colmun-left">
              <img src="image-left.png" alt="leftImage" />
              <h1 className="px-spc-b-20">لا توجد صفحة بهذا الإسم</h1>
              <span className="px-spc-b-20">
                هذه الصفحة لا توجد او تم حذفها
              </span>
              <button className="go-home">
                <i className="fa fa-home"></i>{" "}
                <Link
                  style={{
                    textDecoration: "none",
                    color: "#000",
                    fontWeight: "bold",
                  }}
                  to="/"
                >
                  إذهب إلى الصفحة الرئيسية
                </Link>
              </button>
            </div>
            <div className="colmun colmun-right">
              <img src="right-shape.png" alt="rightImage" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoPage;
