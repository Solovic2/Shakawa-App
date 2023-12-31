import React, { useEffect, useState } from "react";
import "./FilterSearch.css";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import SpinnerComponent from "../CommonComponents/Spinner";
import { Select } from "antd";
import RefreshButton from "../CommonComponents/RefreshButton";
const APP_API_URL = process.env.REACT_APP_API_URL;
const FilterSearch = (props) => {
  const [summary, setSummary] = useState([]);
  const {
    user,
    selectedStatusValue,
    handleStatusFiltration,
    inputValue,
    handleEnterPress,
    handleChange,
    groups,
    handleGroupFiltration,
    selectedGroup,
    isError,
  } = props;
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  let optionUnSeen = { label: "لم تقرأ / تسمع بعد", value: "ON_UNSEEN" };
  const statusOptions = [
    { label: "شكاوى اليوم", value: "ON_TODAY" },
    { label: "جاري الدراسة", value: "ON_HOLD" },
    { label: "تم الحل والتواصل", value: "ON_SOLVE" },
    {
      label:
        user && user.role === "User"
          ? "المطلوب للرد"
          : "بالفرع المختص وجاري الدراسة",
      value: "ON_STUDY",
    },
  ];
  if (user.role !== "User") {
    statusOptions.push(optionUnSeen);
  }
  let groupOptions = [];
  groups?.forEach((element) => {
    groupOptions.push({ label: element.name, value: element.id });
  });
  useEffect(() => {
    setLoading(true);
    fetch(`${APP_API_URL}summary`, {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("You are not authenticated");
          } else {
            const errorData = await response.json();
            console.log(errorData);
            throw new Error("Error fetching data");
          }
        } else {
          const data = await response.json();
          setSummary(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        // removeCookie("user", { path: "/" });
        // navigate("/login");
      });
  }, [refresh]);

  return (
    <>
      <div className="searchBar">
        {loading ? (
          <>
            <SpinnerComponent variant="primary" />
          </>
        ) : (
          <>
            <div className="summary">
              <ListGroup horizontal>
                {summary?.map((element, index) => {
                  let statusValue = "لم تقرأ / تسمع بعد";
                  let bg = "primary";
                  switch (element.status) {
                    case "ON_TOTAL":
                      statusValue = "إجمالي الشكاوى";
                      bg = "primary";
                      break;
                    case "ON_UNSEEN":
                      statusValue = "الشكاوى التي لم تقرأ / تسمع بعد";
                      bg = "danger";
                      break;
                    case "ON_HOLD":
                      statusValue = "الشكاوى الجاري دراستها";
                      bg = "secondary";
                      break;
                    case "ON_SOLVE":
                      statusValue = "الشكاوى التي تم حلها والتواصل";
                      bg = "success";
                      break;
                    case "ON_STUDY":
                      if (user && user.role === "User") {
                        statusValue = "الشكاوى المطلوب الرد عليها";
                        bg = "danger";
                      } else {
                        statusValue = "الشكاوى التي بالفرع المختص";
                        bg = "warning";
                      }
                      break;
                    default:
                      statusValue = "الشكاوى التي لم تقرأ / تسمع بعد";
                      break;
                  }
                  return (
                    <ListGroup.Item
                      style={{ direction: "rtl" }}
                      variant="primary"
                      key={index}
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div className="ms-2 mr-auto">
                        <div className="fw-bold fs-5">{statusValue}</div>
                      </div>
                      <Badge
                        bg={bg}
                        text={bg === "warning" ? "black" : "white"}
                        pill
                        className="fs-6"
                      >
                        {element._count.status}
                      </Badge>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
              <div>
                <RefreshButton
                  color={"primary"}
                  handleClick={() => setRefresh((prev) => !prev)}
                />
              </div>
            </div>
          </>
        )}
        <Form>
          <Row>
            <Col xs={4} md={4}>
              <Form.Group>
                <Form.Control
                  type="search"
                  placeholder="بحث بالتاريخ ورقم الهاتف"
                  value={inputValue}
                  onKeyDown={handleEnterPress}
                  onChange={handleChange}
                  isInvalid={isError}
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                    borderRadius: "5px",
                    fontFamily: "Arial",
                    direction: "rtl",
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  الرجاء التأكد بكتابة رقم التليفون أو التاريخ على صورة
                  يوم-شهر-سنة
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={4} md={4}>
              <Select
                allowClear
                className="custom-select"
                style={{
                  textAlign: "center",
                  direction: "rtl",
                  width: "100%",
                  height: "100%",
                }}
                placeholder="تصنيف (فلتر)"
                defaultValue={selectedStatusValue}
                onChange={handleStatusFiltration}
                options={statusOptions}
              />
            </Col>
            {user.role !== "User" && (
              <Col xs={4} md={4}>
                <Select
                  allowClear
                  className="custom-select"
                  style={{
                    textAlign: "center",
                    direction: "rtl",
                    width: "100%",
                    height: "100%",
                  }}
                  placeholder="القسم..."
                  defaultValue={selectedGroup}
                  onChange={handleGroupFiltration}
                  disabled={selectedStatusValue === "ON_UNSEEN"}
                  options={groupOptions}
                />
              </Col>
            )}
          </Row>
        </Form>
      </div>
    </>
  );
};

export default FilterSearch;
