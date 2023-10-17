import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import "./ModalComponent.css";
import Button from "../CommonComponents/Button";
const ModalComponent = ({
  isAudio,
  complainTitle,
  dbData,
  mobileNumber,
  unSplittedPath,
}) => {
  const [show, setShow] = useState({});

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
  let fullPath = unSplittedPath.split("\\");
  const path = fullPath[fullPath.length - 1];
  return (
    <>
      <div className="complain-type">
        <label className="complain-title"> :{complainTitle}</label>
        <>
          <Button
            className={isAudio ? "btn btn-primary" : "btn btn-dark"}
            handleClick={() => (isAudio ? handleShow(path) : handleShow(path))}
            body={complainTitle}
          />
          <Modal
            style={isAudio ? { textAlign: "center" } : {}}
            show={show[path]}
            onHide={() => handleClose(path)}
          >
            <Modal.Header closeButton>
              <Modal.Title style={{ margin: "auto" }}>
                {complainTitle} الخاصة بالرقم : {mobileNumber}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body
              className={!isAudio ? "grid-example" : ""}
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
                  {dbData !== null && (
                    <>
                      <Container>
                        <Row>
                          {dbData.type !== null && (
                            <>
                              <Col xs={3} className="labels-font">
                                الصفة :
                              </Col>
                              <Col xs={9} className="labels-font">
                                {dbData.type === "Soldier"
                                  ? "عسكري"
                                  : dbData.type === "Civil"
                                  ? "مدني"
                                  : "غير محدد"}
                              </Col>
                            </>
                          )}
                        </Row>
                        {dbData.type === "Soldier" && (
                          <>
                            <Row>
                              <Col xs={3} className="labels-font">
                                رقم العضوية :
                              </Col>
                              <Col xs={2}>{dbData.MID}</Col>
                              <Col xs={4} className="labels-font">
                                الرقم العسكري :
                              </Col>
                              <Col xs={3}>{dbData.SID}</Col>
                            </Row>
                          </>
                        )}
                        {dbData.name !== null && (
                          <>
                            <Row>
                              <Col xs={2} className="labels-font">
                                الإسم :
                              </Col>
                              <Col xs={10} className="labels-font">
                                {dbData.name}
                              </Col>
                            </Row>
                          </>
                        )}
                        {dbData.email !== null && (
                          <>
                            <Row>
                              <Col xs={4} className="labels-font">
                                البريد الإلكتروني :
                              </Col>
                              <Col xs={8}>{dbData.email}</Col>
                            </Row>
                          </>
                        )}

                        <Row>
                          <Col xs={3} className="fs-5">
                            الشكوى :
                          </Col>
                          <Col xs={9} className="fs-5">
                            {dbData.complainText
                              ? dbData.complainText
                              : "لا توجد شكوى !"}
                          </Col>
                        </Row>
                      </Container>
                    </>
                  )}
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
