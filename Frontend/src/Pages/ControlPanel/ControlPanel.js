import React, { useEffect, useRef, useState } from "react";
import "./ControlPanel.css";
import { useNavigate } from "react-router-dom";
import Table from "../../Components/ControlPanel/Table";
import AdminPanel from "../../Components/ControlPanel/AdminPanel";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import NavBarList from "../../Components/CommonComponents/NavBarList";
import Button from "../../Components/CommonComponents/Button";
import Modal from "react-bootstrap/Modal";
const ControlPanel = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [show, setShow] = useState([false, "success", ""]);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const token = Cookies.get("user");
  // Check Authorization
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        setUser(decodedToken);
      } catch (error) {
        console.log("Invalid token:", error);
      }
    } else {
      navigate("/");
      return;
    }
  }, [token, navigate]);

  useEffect(() => {
    if (user) {
      if (user.role !== "Admin") {
        navigate("/");
        return;
      }
    }
  }, [user, navigate]);
  useEffect(() => {
    fetch("http://localhost:9000/admin/users", {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => setUsers(data))
      .catch((error) => {
        console.error(error.message);
      });
  }, [navigate]);

  const handleClick = (path) => {
    navigate(path, {
      state: { user: user },
    });
  };

  const handleBack = () => {
    navigate("/");
  };
  const handleEdit = (userID) => {
    navigate(`/control-panel-admin/edit/${userID}`, {
      state: { user: user },
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        "http://localhost:9000/admin/delete-user/" + id,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete card");
      } else {
        const updatedUsers = users.filter((user) => user.id !== id);
        setUsers(updatedUsers);
      }

      // Remove the deleted card from the state
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      fetch("http://localhost:9000/admin/upload-excel-sheet", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.text())
        .then((records) => {
          if (!records)
            setShow([
              true,
              "warning",
              "لا توجد بيانات في الإكسيل شيت أو الإكسيل شيت ليس على الفورمات الصحيح",
            ]);
          else setShow([true, "success", "تم رفع الإكسيل شيت بنجاح"]);
        })
        .catch((error) => {
          setShow([true, "danger", error.message]);
        });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleCustomButtonClick = () => {
    // Trigger the hidden file input element
    fileInputRef.current.click();
  };
  if (!user || (user && user.role !== "Admin")) {
    return null;
  }

  return (
    <>
      <div className="container-body">
        <AdminPanel>
          <NavBarList
            user={user}
            users={users}
            isHomePage={false}
            handleBack={handleBack}
            handleClick={handleClick}
          />
          <div className="container">
            <input
              type="file"
              accept={[".xlsx", ".xls"]}
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button
              className={"btn btn-secondary"}
              handleClick={handleCustomButtonClick}
              body={
                <>
                  <i
                    className="fa-solid fa-upload"
                    style={{ color: "#fff" }}
                  ></i>{" "}
                  رفع الإكسيل شيت لقاعدة البيانات
                </>
              }
            />
            <Modal
              show={show[0]}
              dialogClassName={
                show[1] === "success"
                  ? "modal-success-border"
                  : "modal-danger-border"
              }
              onHide={() => setShow([false, "", ""])}
            >
              <Modal.Body
                style={{
                  textAlign: "center",
                  fontSize: "50px",
                  marginTop: "25px",
                }}
              >
                {show[1] === "success" ? (
                  <i
                    className="fa-regular fa-circle-check fa-2xl"
                    style={{ color: "#207e27" }}
                  ></i>
                ) : (
                  show[1] === "danger" && (
                    <i
                      className="fa-solid fa-circle-exclamation fa-2xl"
                      style={{ color: "#ff0000" }}
                    ></i>
                  )
                )}
              </Modal.Body>
              <Modal.Footer style={{ margin: "auto", fontSize: "20px" }}>
                {show[2]}
              </Modal.Footer>
            </Modal>
          </div>

          <Table
            users={users}
            groups={null}
            handleClick={handleClick}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </AdminPanel>
      </div>
    </>
  );
};

export default ControlPanel;
