import React, { useEffect, useState } from "react";
import "./FilterSearch.css";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import SpinnerComponent from "../CommonComponents/Spinner";
import { Select } from "antd";
const FilterSearch = (props) => {
  const [summary, setSummary] = useState([]);
  const {
    user,
    selectedValue,
    handleFiltration,
    inputValue,
    handleEnterPress,
    handleChange,
    isError,
  } = props;
  const [loading, setLoading] = useState(false);
  let optionUnSeen = { label: "لم تقرأ / تسمع بعد", value: "ON_UNSEEN" };
  const options = [
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
    options.push(optionUnSeen);
  }
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:9000/summary", {
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
  }, []);

  return (
    <>
      <div className="searchBar">
        <Row>
          <Col xs={3} md={3}>
            {loading ? (
              <>
                <SpinnerComponent variant="primary" />
              </>
            ) : (
              <>
                <div className="summary">
                  <ListGroup>
                    {summary?.map((element, index) => {
                      let statusValue = "لم تقرأ / تسمع بعد";
                      switch (element.status) {
                        case "ON_TOTAL":
                          statusValue = "إجمالي الشكاوى";
                          break;
                        case "ON_UNSEEN":
                          statusValue = "الشكاوى التي لم تقرأ / تسمع بعد";
                          break;
                        case "ON_HOLD":
                          statusValue = "الشكاوى الجاري دراستها";
                          break;
                        case "ON_SOLVE":
                          statusValue = "الشكاوى التي تم حلها والتواصل";
                          break;
                        case "ON_STUDY":
                          if (user && user.role === "User") {
                            statusValue = "الشكاوى المطلوب الرد عليها";
                          } else {
                            statusValue = "الشكاوى التي بالفرع المختص";
                          }
                          break;
                        default:
                          statusValue = "الشكاوى التي لم تقرأ / تسمع بعد";
                          break;
                      }
                      return (
                        <ListGroup.Item
                          variant="dark"
                          key={index}
                          className="d-flex justify-content-between align-items-start"
                        >
                          <div className="ms-2 mr-auto">
                            <div className="fw-bold fs-5">{statusValue}</div>
                          </div>
                          <Badge bg="primary" pill>
                            {element._count.status}
                          </Badge>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </div>
              </>
            )}
          </Col>
          <Col xs={9} md={8}>
            <Form>
              <Row>
                <Col xs={3} md={4}>
                  <Form.Group>
                    <Form.Control
                      type="search"
                      placeholder="بحث بالتاريخ ورقم الهاتف"
                      value={inputValue}
                      onKeyDown={handleEnterPress}
                      onChange={handleChange}
                      isInvalid={isError}
                    />
                    <Form.Control.Feedback type="invalid">
                      الرجاء التأكد بكتابة رقم التليفون أو التاريخ على صورة
                      يوم-شهر-سنة
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={3} md={4}>
                  <Select
                    allowClear
                    style={{
                      textAlign: "center",
                      direction: "rtl",
                      width: "100%",
                    }}
                    placeholder="تصنيف (فلتر)"
                    defaultValue={selectedValue}
                    onChange={handleFiltration}
                    options={options}
                  />
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default FilterSearch;
