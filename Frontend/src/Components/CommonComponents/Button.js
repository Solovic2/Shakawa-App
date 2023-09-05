const Button = ({type, className, handleClick , body}) => {
  return (
    <>
      <button
        type={type ? type : "button"}
        className={className}
        onClick={handleClick ? handleClick : undefined}
      >
        {body}
      </button>
    </>
  );
};

export default Button;
