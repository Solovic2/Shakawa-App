import React, { useEffect, useRef, useState } from "react";
import "./FilterCards.css";
import SelectComponent from "./SelectComponent";
import ModalComponent from "./ModalComponent";
import Button from "../CommonComponents/Button";
import Modal from "react-bootstrap/Modal";
import "./ModalComponent.css";
const APP_API_URL = process.env.REACT_APP_API_URL;
function FilterCards({
  user,
  data,
  pageSize,
  page,
  setPage,
  total,
  setFilterData,
  setValues,
  notify,
}) {
  const infoContainerRef = useRef(null);
  const [showForm, setShowForm] = useState({});
  const [showAttachForm, setShowAttachForm] = useState({});
  const [showModal, setShowModal] = useState({});
  const [cardClass, setCardClass] = useState("card");
  const [groups, setGroups] = useState([]);
  const [selectedValues, setSelectedStatusValues] = useState({});

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
    fetch(`${APP_API_URL}groups`, {
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
    setShowModal((prev) => ({
      ...prev,
      [path]: false,
    }));
  const handleShow = (path) =>
    setShowModal((prev) => ({
      ...prev,
      [path]: true,
    }));
  // Handle Delete
  const handleDelete = async (path) => {
    try {
      const response = await fetch(
        `${APP_API_URL}delete-complain/${encodeURI(path)}`,
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
        setSelectedStatusValues((prevValues) => {
          const updatedValues = { ...prevValues };
          delete updatedValues[path];
          return updatedValues;
        });
      }
      handleClose(path);
      const updatedData = data.filter((data) => data.path !== deleteData.path);
      setFilterData(updatedData);
      notify(5, (prev) => prev - 1);
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
          `${APP_API_URL}update-complain/${encodeURI(path)}`,
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
                return {
                  ...card,
                  repliedBy: data.userId === null ? null : data.repliedBy,
                  info: data.info,
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
    setSelectedStatusValues((prevSelectedStatusValues) => ({
      ...prevSelectedStatusValues,
      [path]: selectedValue,
    }));
  };

  const handleAttachShakwaToGroup = async (event, path, record, group) => {
    event.preventDefault();
    const selection = selectedValues[path] ? selectedValues[path] : group;
    const formData = {
      path: path,
      record: record,
      group: selection,
    };

    try {
      const response = await fetch(`${APP_API_URL}attach-file-to-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
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
                id: data.id,
                info: data.info,
                repliedBy: data.userId === null ? null : data.repliedBy,
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
        let statusBadge = "badge text-bg-danger";
        let statusValue =
          element.fileType === "txt" ? "لم تقرأ بعد" : "لم تسمع بعد";
        switch (element.status) {
          case "ON_UNSEEN":
            statusBadge = "badge text-bg-danger";
            statusValue =
              element.fileType === "txt" ? "لم تقرأ بعد" : "لم تسمع بعد";
            break;
          case "ON_HOLD":
            statusBadge = "badge text-bg-secondary";
            statusValue = "جاري الدراسة";
            break;
          case "ON_SOLVE":
            statusBadge = "badge bg-success";
            statusValue = "تم الحل والتواصل";
            break;
          case "ON_STUDY":
            if (user && user.role === "User") {
              statusBadge = "badge text-bg-danger";
              statusValue = "مطلوب الرد";
            } else {
              statusBadge = "badge text-bg-warning";
              statusValue = "بالفرع المختص";
            }

            break;

          default:
            statusBadge = "badge text-bg-danger";
            break;
        }
        return (
          <div key={element.path} id="card" className={cardClass}>
            {element.id && (
              <>
                <div className="code">
                  <label className="card-label">
                    <span className="badge text-bg-secondary">
                      #{element.id}
                    </span>
                    <span className="card-info"> :كود الشكوى</span>
                  </label>
                </div>
              </>
            )}
            <div
              className="mobile"
              style={{ marginTop: !element.id && "40px" }}
            >
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
            <div className="audio-element">
              <ModalComponent
                isAudio={element.fileType === "wav"}
                complainTitle={
                  element.fileType === "txt" ? "تفاصيل الشكوى" : "سماع الشكوى"
                }
                dbData={
                  element.fileType === "txt" && element.record !== null
                    ? element.record
                    : null
                }
                mobileNumber={element.mobile}
                unSplittedPath={element.path}
              />
            </div>
            <div className="card-status">
              <span className={statusBadge}>{statusValue}</span>
            </div>

            {user && user.role === "Admin" && (
              <div className="deleteBtn">
                <Button
                  className={"btn"}
                  handleClick={() => handleShow(element.path)}
                  body={<i className="fa-solid fa-trash"></i>}
                />
                <Modal
                  backdrop="static"
                  keyboard={false}
                  show={showModal[element.path]}
                  onHide={() => handleClose(element.path)}
                >
                  <Modal.Header style={{ textAlign: "center" }} closeButton>
                    <Modal.Title style={{ width: "100%", textAlign: "center" }}>
                      {" "}
                      إخفاء الشكوى الخاصة بالرقم {element.mobile}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body style={{ direction: "rtl" }}>
                    لا يمكنك إعادة هذه الشكوى بعد إخفائها إلا بعد الرجوع للنظم
                    هل أنت متأكد من انك تريد إخفاء الشكوى ؟
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      className={"btn btn-secondary"}
                      handleClick={() => handleClose(element.path)}
                      body={"لا"}
                    />
                    <Button
                      className={"btn btn-danger"}
                      handleClick={() => handleDelete(element.path)}
                      body={"نعم"}
                    />
                  </Modal.Footer>
                </Modal>
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
                      element.record !== null ? element.record.id : null,
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
                    isManager={user && user.role === "Manager"}
                  />
                  {(element.groupId === null ||
                    showAttachForm[element.path]) && (
                    <Button
                      type={"submit"}
                      className={"btn btn-success"}
                      body={"تمرير الشكوى"}
                    />
                  )}
                </form>
                {element.groupId !== null && user.role === "Admin" && (
                  <div className="edit-button">
                    <Button
                      handleClick={() => handleEditAttachShakwa(element.path)}
                      body={showAttachForm[element.path] ? "إلغاء" : "تعديل"}
                    />
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
                    <Button
                      handleClick={() => handleEdit(element.path)}
                      body={showForm[element.path] ? "إلغاء" : "تعديل"}
                    />
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
                        isManager={null}
                      />

                      <input
                        type="text"
                        name="infoInput"
                        className="my-input mr-2"
                        placeholder="الرد"
                        defaultValue={element.info}
                        onInput={(e) => {
                          e.target.setCustomValidity("");
                        }}
                        onInvalid={(e) =>
                          e.target.setCustomValidity("برجاء الرد على الشكوى")
                        }
                        required
                      />
                      <Button
                        type={"submit"}
                        className={"btn btn-sm btn-success"}
                        body={showForm[element.path] ? "تعديل" : "إضافة رد"}
                      />
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
