const Button = (props) => {

  return (
    <>
      <button type="button" className= {props.className} onClick={props.handleClick}>{props.body}</button>
    </>
  )
}

export default Button