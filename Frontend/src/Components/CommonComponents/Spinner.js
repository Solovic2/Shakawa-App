import React from "react";
import Spinner from "react-bootstrap/Spinner";

const SpinnerComponent = ({ variant }) => {
  return (
    <div style={{ textAlign: "center" }}>
      <Spinner animation="border" variant={variant} role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default SpinnerComponent;
