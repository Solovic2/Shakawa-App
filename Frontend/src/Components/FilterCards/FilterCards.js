import React, { useEffect, useRef, useState } from "react";
import "./FilterCards.css";
import SelectComponent from "./SelectComponent";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
function FilterCards({ user, data, setFilterData, setValues, notify }) {
  const infoContainerRef = useRef(null);
  const [showForm, setShowForm] = useState({});
  const [showAttachForm, setShowAttachForm] = useState({});
  const [cardClass, setCardClass] = useState("card");
  const [groups, setGroups] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [show, setShow] = useState({});
  const [fileContent, setFileContent] = useState();

  useEffect(() => {
    if (user) {
      setCardClass(
        user.role === "Admin"
          ? "card card-admin"
          : user.role === "Manager"
          ? "card card-manager"
          : user.role === "User"
          ? "card card-user"
          : "card"
      );
    } else {
      setCardClass("card");
    }
  }, [user]);

  // Show ScrollBar When There Are Elements Fit The Height Of The ScrollBar Or Hide It When No Element Fit The Width
  useEffect(() => {
    const infoContainer = infoContainerRef.current;
    if (!infoContainer) {
      return;
    }
    function toggleScrollbar() {
      if (infoContainer.scrollHeight > infoContainer.clientHeight) {
        infoContainer.classList.remove("show-scrollbar");
      } else {
        infoContainer.classList.add("show-scrollbar");
      }
    }
    window.addEventListener("resize", toggleScrollbar);
    toggleScrollbar();
    return () => {
      window.removeEventListener("resize", toggleScrollbar);
    };
  }, []);

  useEffect(() => {
    fetch("http://localhost:9000/groups", {
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
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleClose = (path) =>
    setShow((prev) => ({
      ...prev,
      [path]: false,
    }));
  const handleShow = (path) =>
    setShow((prev) => ({
      ...prev,
      [path]: true,
    }));
  // Show Shakwa When Press The Button
  const handleClick = async (path) => {
    fetch(`http://localhost:9000/file/${path}`, { credentials: "include" })
      .then((response) => response.text())
      .then((fileContents) => {
        handleShow(path);
        setFileContent(fileContents);
      });
  };

  // Handle Delete
  const handleDelete = async (path) => {
    try {
      const response = await fetch(
        `http://localhost:9000/delete-complain/${encodeURI(path)}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to hide card");
      }
      const deleteData = await response.json();
      if (selectedValues[path]) {
        setSelectedValues((prevValues) => {
          const updatedValues = { ...prevValues };
          delete updatedValues[path];
          return updatedValues;
        });
      }
      setFilterData((prevValues) =>
        prevValues.filter((data) => data.path !== deleteData.path)
      );
      notify(2, (prev) => prev - 1);
      // if(deleteData){
      //   await setValues((prevValues) =>
      //   prevValues.filter((card) => card.path !== deleteData.path)
      // );

      // await setFilterData((prevValues) => prevValues.filter(data => data.path !== deleteData.path));
      // notify(2, prev => prev - 1)
      // console.log(data);
      // }

      // Remove the deleted card from the state
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  // Handle Edit Reply Submit
  const handleEdit = (path) => {
    setShowForm((prevShowForm) => ({
      ...prevShowForm,
      [path]: !prevShowForm[path],
    }));
  };

  // Handle When Submit
  const handleSubmit = async (event, path, status) => {
    event.preventDefault(); // prevent default form submission behavior
    const inputValue = event.target.elements.infoInput.value;
    const selection = selectedValues[path] ? selectedValues[path] : status;
    if (inputValue !== "") {
      const formData = {
        info: inputValue,
        status: selection,
      };
      try {
        const response = await fetch(
          `http://localhost:9000/update-complain/${encodeURI(path)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete card");
        }
        const data = await response.json();
        if (data) {
          setFilterData((prevData) => {
            const updatedData = prevData.map((card) => {
              if (card.path === path) {
                return { ...card, info: data.info, status: data.status };
              }
              return card;
            });
            return updatedData;
          });
        } else {
          console.log("Error On submitting");
        }
        setShowForm((prevShowForm) => ({
          ...prevShowForm,
          [path]: false,
        }));
      } catch (error) {
        console.error("Error deleting card:", error);
      }
    }
  };

  // Handle Edit Reply Submit
  const handleEditAttachShakwa = (path) => {
    setShowAttachForm((prevShowForm) => ({
      ...prevShowForm,
      [path]: !prevShowForm[path],
    }));
  };

  const handleSelectChange = (path, selectedValue) => {
    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [path]: selectedValue,
    }));
  };

  const handleAttachShakwaToGroup = async (event, path, group) => {
    event.preventDefault();
    const selection = selectedValues[path] ? selectedValues[path] : group;
    const formData = {
      path: path,
      group: selection,
    };
    try {
      const response = await fetch(
        "http://localhost:9000/attach-file-to-group",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("You are not authenticated");
        } else {
          throw new Error("Error fetching data");
        }
      }

      const data = await response.json();
      if (data) {
        setFilterData((prevData) => {
          const updatedData = prevData.map((card) => {
            if (card.path === path) {
              return {
                ...card,
                info: data.info,
                repliedBy: data.userId === null ? null : card.repliedBy,
                groupId: data.groupId,
                status: data.status,
              };
            }
            return card;
          });
          return updatedData;
        });
      } else {
        console.log("Error On submitting");
      }
      setShowAttachForm((prevShowForm) => ({
        ...prevShowForm,
        [path]: false,
      }));
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="card-container hide-scrollbar">
      {data?.map((element) => {
        let audioElement = null;
        let fullPath = element.path.split("\\");
        const path = fullPath[fullPath.length - 1];
        if (element.fileType === "wav") {
          audioElement = (
            <div className="audio">
              <label className="audio-float"> :سماع الشكوى</label>
              <>
                <Button variant="primary" onClick={() => handleShow(path)}>
                  سماع الشكوى
                </Button>
                <Modal style={{textAlign:"center"}} show={show[path]} onHide={() => handleClose(path)}>
                  <Modal.Header closeButton>
                    <Modal.Title style={{margin: "auto"}}>
                      سماع الشكوى الخاصة بالرقم : {element.mobile}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <audio
                      controls
                      src={`http://localhost:9000/audio/${encodeURI(path)}`}
                    />
                  </Modal.Body>
                </Modal>
              </>
            </div>
          );
        } else {
          audioElement = (
            <div className="button">
              <label className="audio-float"> :قراءة الشكوى</label>
              <>
                <Button variant="primary" onClick={() => handleClick(path)}>
                  قراءة الشكوى
                </Button>
                <Modal show={show[path]} onHide={() => handleClose(path)}>
                  <Modal.Header closeButton>
                    <Modal.Title style={{margin: "auto"}}>
                      قراءة الشكوى الخاصة بالرقم : {element.mobile}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body style={{
                      direction: "rtl",
                      overflowWrap: "break-word"
                    }}
                  >
                    <div >
                      <p>{fileContent}</p>
                    </div>
                  </Modal.Body>
                </Modal>
              </>
            </div>
          );
        }
        let statusBadge = "badge text-bg-danger";
        let statusValue = "لم تقرأ بعد";
        switch (element.status) {
          case "ON_UNSEEN":
            statusBadge = "badge text-bg-danger";
            statusValue = "لم تقرأ بعد";
            break;
          case "ON_HOLD":
            statusBadge = "badge text-bg-warning";
            statusValue = "قيد الإنتظار";
            break;
          case "ON_SOLVE":
            statusBadge = "badge bg-success";
            statusValue = "تم الحل";
            break;

          default:
            statusBadge = "badge text-bg-danger";
            break;
        }
        return (
          <div key={element.path} id="card" className={cardClass}>
            <div className="mobile">
              <label className="card-label">
                {element.mobile || "UnKnown"}
                <span className="card-info"> :رقم الهاتف</span>
              </label>
            </div>
            <div className="file-date">
              <label className="card-label">
                {element.fileDate}
                <span className="card-info"> :تاريخ الشكوى</span>
              </label>
            </div>
            <div className="audio-element">{audioElement}</div>
            <div className="card-status">
              <span className={statusBadge}>{statusValue}</span>
            </div>
            {user && user.role !== "User" && (
              <div className="deleteBtn">
                <button
                  className="btn"
                  onClick={() => handleDelete(element.path)}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            )}
            {user && user.role !== "User" && (
              <div className="attach-file">
                <label className="card-label">
                  <span className="card-info"> تمرير الشكوى لقسم: </span>
                </label>
                <form
                  onSubmit={(event) =>
                    handleAttachShakwaToGroup(
                      event,
                      element.path,
                      element.groupId
                    )
                  }
                >
                  <SelectComponent
                    key={element.path}
                    element={element}
                    groups={groups}
                    status={null}
                    onSelectChange={(selectedValue) =>
                      handleSelectChange(element.path, selectedValue)
                    }
                    edit={showAttachForm[element.path]}
                  />

                  {(element.groupId === null ||
                    showAttachForm[element.path]) && (
                    <button className="btn btn-success" type="submit">
                      تمرير الشكوى
                    </button>
                  )}
                </form>
                {element.groupId !== null && (
                  <div className="edit-button">
                    <button
                      onClick={() => handleEditAttachShakwa(element.path)}
                    >
                      {showAttachForm[element.path] ? "إلغاء" : "تعديل"}
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="reply-and-edit">
              <label>
                {element.repliedBy !== null ? (
                  <>
                    تم الرد بواسطة الموظف : &nbsp;
                    <span className="badge bg-primary">
                      {element.repliedBy}
                    </span>
                  </>
                ) : (
                  <>الرد :</>
                )}
              </label>
              <div className="scrollable-container" ref={infoContainerRef}>
                {element.info !== null && element.info !== "" ? (
                  <div className="scrollable-content">{element.info}</div>
                ) : (
                  <div className="scrollable-content">لم يتم الرد حتى الآن</div>
                )}
              </div>
            </div>

            {user && user.role === "User" && (
              <>
                {element.info !== null && element.info !== "" && (
                  <div className="edit-button">
                    <button onClick={() => handleEdit(element.path)}>
                      {showForm[element.path] ? "إلغاء" : "تعديل"}
                    </button>
                  </div>
                )}
                {(element.info === null ||
                  element.info === "" ||
                  showForm[element.path]) && (
                  <div className="form-submit">
                    <form
                      onSubmit={(event) =>
                        handleSubmit(event, element.path, element.status)
                      }
                    >
                      <SelectComponent
                        key={element.path}
                        element={element}
                        groups={null}
                        status={["ON_SOLVE", "ON_HOLD"]}
                        onSelectChange={(selectedValue) =>
                          handleSelectChange(element.path, selectedValue)
                        }
                        edit={showForm[element.path]}
                      />

                      <input
                        type="text"
                        name="infoInput"
                        className="my-input mr-2"
                        placeholder="الرد"
                        defaultValue={element.info}
                        required
                        onInvalid={(e) =>
                          e.target.setCustomValidity("برجاء الرد على الشكوى")
                        }
                      />

                      <button type="submit" className="btn btn-sm btn-success">
                        {showForm[element.path] ? "تعديل" : "إضافة رد"}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FilterCards;
