import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import "./ModalComponent.css";
import Button from "../CommonComponents/Button";
const ModalComponent = ({ isAudio, complainTitle, mobileNumber, unSplittedPath }) => {
  const [show, setShow] = useState({});
  const [fileContent, setFileContent] = useState();
  
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

  let fullPath = unSplittedPath.split("\\");
  const path = fullPath[fullPath.length - 1];  
  return (
    <>
      <div className="complain-type">
        <label className="complain-title"> :{complainTitle}</label>
        <>
        <Button className={"btn btn-primary"} handleClick={() => (isAudio ? handleShow(path) : handleClick(path))} body={complainTitle}/>
          <Modal style={isAudio ? { textAlign: "center" } : {}}show={show[path]} onHide={() => handleClose(path)}>
            <Modal.Header closeButton>
              <Modal.Title style={isAudio ? { margin: "auto" } : {}}>
                {complainTitle} الخاصة بالرقم : {mobileNumber}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body
              style={
                !isAudio
                  ? {
                      direction: "rtl",
                      overflowWrap: "break-word",
                    }
                  : {}
              } 
            >
              {isAudio ? (
                <audio
                  controls
                  src={`http://localhost:9000/audio/${encodeURI(path)}`}
                />
              ) : (
                <div>
                  <p>{fileContent}</p>
                </div>
              )}
            </Modal.Body>
          </Modal>
        </>
      </div>
    </>
  );
};

export default ModalComponent;
