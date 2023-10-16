import React from "react";
import "./FilterSearch.css";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { Select } from "antd";
const FilterSearch = (props) => {
  const {
    user,
    selectedValue,
    handleFiltration,
    inputValue,
    handleEnterPress,
    handleChange,
    isError,
  } = props;

  let optionUnSeen = { label: "لم تقرأ / تسمع بعد", value: "ON_UNSEEN" };
  const options = [
    { label: "شكاوى اليوم", value: "ON_TODAY" },
    { label: "جاري الدراسة", value: "ON_HOLD" },
    { label: "تم الحل والتواصل", value: "ON_SOLVE" },
    {
      label: user && user.role === "User" ? "المطلوب للرد" : "بالفرع المختص",
      value: "ON_STUDY",
    },
  ];
  if (user.role !== "User") {
    options.push(optionUnSeen);
  }

  return (
    <>
      <div className="searchBar">
        <Form>
          <Row>
            <Col xs={5}>
              <Select
                allowClear
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  width: "100%",
                }}
                placeholder="تصنيف (فلتر)"
                defaultValue={selectedValue}
                onChange={handleFiltration}
                options={options}
              />
            </Col>
            <Col xs={7}>
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
          </Row>
        </Form>
      </div>
    </>
  );
};

export default FilterSearch;
