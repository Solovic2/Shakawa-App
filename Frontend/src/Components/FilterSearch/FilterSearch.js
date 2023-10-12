import React from "react";
import "./FilterSearch.css";
import Button from "../CommonComponents/Button";
import Form from "react-bootstrap/Form";
const FilterSearch = (props) => {
  const {isToggled } = props;
  console.log(isToggled);
  return (
    <>
      <div className="searchBar">
        <Button
          className={"btn btn-info toggleBtn"}
          handleClick={props.handleClickToggleButton}
          body={isToggled ? "رجوع" : "شكاوي اليوم"}
        />
        <Form>
          <Form.Group>
            <Form.Control
              type="search"
              placeholder="بحث بالتاريخ ورقم الهاتف"
              value={props.inputValue}
              onKeyDown={props.handleEnterPress}
              onChange={props.handleChange}
              isInvalid={props.isError}
            />
            <Form.Control.Feedback type="invalid">
              الرجاء التأكد بكتابة رقم التليفون أو التاريخ على صورة يوم-شهر-سنة
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </div>
    </>
  );
};

export default FilterSearch;
