import React from 'react'
import "./FilterSearch.css"
import { useNavigate } from 'react-router';

const FilterSearch = (props) => {

  const navigate = useNavigate()
  const {setValues, setFilterData, setIsToggled, isToggled } = props;

  const handleClick = async (event) => {
    event.preventDefault();
    setIsToggled(!isToggled);
    if (!isToggled) {
      // execute function when button is toggled on
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      fetch(`http://localhost:9000/dateToday/${formattedDate}`, { credentials: 'include' })
        .then((response) => response.json())
        .then((data) => {
          setFilterData(data);
        });
    } else {
      fetch("http://localhost:9000/", {
        credentials: 'include'
      }).then(async response => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('You are not authenticated');
          } else {
            throw new Error('Error fetching data');
          }
        }

        const data = await response.json();
        if (data) {
          setValues(data);
          setFilterData(data);
          setIsToggled(false);
        }
      })
        .catch(error => {
          console.error(error);
          navigate("/login");
        });
    }
  };

  return (
    <>
      <div className='searchBar'>
        <button className='btn btn-info toggleBtn' onClick={handleClick}>{isToggled ? "رجوع" : "شكاوي اليوم"}</button>
        <input className="search" type="search" placeholder="البحث" onChange={props.handleChange} />
      </div>
    </>
  )
}

export default FilterSearch