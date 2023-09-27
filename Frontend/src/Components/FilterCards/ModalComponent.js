import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import "./ModalComponent.css";
import Button from "../CommonComponents/Button";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ModalComponent = ({
  isAudio,
  complainTitle,
  mobileNumber,
  unSplittedPath,
}) => {
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
      .then((response) => response.json())
      .then((fileContents) => {
        handleShow(path);
        setFileContent(fileContents.data);
      });
  };

  let fullPath = unSplittedPath.split("\\");
  const path = fullPath[fullPath.length - 1];
  return (
    <>
      <div className="complain-type">
        <label className="complain-title"> :{complainTitle}</label>
        <>
          <Button
            className={"btn btn-primary"}
            handleClick={() => (isAudio ? handleShow(path) : handleClick(path))}
            body={complainTitle}
          />
          <Modal
            style={isAudio ? { textAlign: "center" } : {}}
            show={show[path]}
            size={!isAudio ? "xl": "md" }
            dialogClassName="custom-modal"
            onHide={() => handleClose(path)}
          >
            <Modal.Header closeButton>
              <Modal.Title style={{ width: "100%", textAlign: "center" }}>
                {complainTitle} الخاصة بالرقم : {mobileNumber}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className={!isAudio ? "image-container" : ""}>
              {isAudio ? (
                <audio
                  controls
                  src={`http://localhost:9000/audio/${encodeURI(path)}`}
                />
              ) : (
                <>
                  {fileContent && (
                    <TransformWrapper>
                      <TransformComponent>
                        <img
                          src={`data:${fileContent.contentType};base64,${fileContent}`}
                          alt="Preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "600px",
                          }}
                        />
                      </TransformComponent>
                    </TransformWrapper>
                  )}
                </>
              )}
            </Modal.Body>
          </Modal>
        </>
      </div>
    </>
  );
};

export default ModalComponent;
