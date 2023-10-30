import React from "react";
import Button from "./Button";
const RefreshButton = ({ message, color, handleClick }) => {
  return (
    <>
      <Button
        body={
          <>
            <i
              className="fa-solid fa-rotate-right"
              style={{ color: "#fff" }}
            ></i>{" "}
            {message}
          </>
        }
        className={`btn btn-${color}`}
        handleClick={handleClick}
      />
    </>
  );
};

export default RefreshButton;
