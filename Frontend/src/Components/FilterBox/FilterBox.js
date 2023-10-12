import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import FilterSearch from "../FilterSearch/FilterSearch";
import FilterCards from "../FilterCards/FilterCards";
import { useCookies } from "react-cookie";
import { Pagination } from "antd";

const FilterBox = ({ user, notify }) => {
  const navigate = useNavigate();
  const [values, setValues] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [eventAction, setEventAction] = useState();
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState(false);
  const [, , removeCookie] = useCookies(["user"]);
  const [isToggled, setIsToggled] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState("*");
  useEffect(() => {
    fetchData(searchQuery, page, pageSize);
  }, [searchQuery, page, pageSize]);
  // Get Data From Database And Use WebSocket To Listen When File Added Or Deleted
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:9099");

    ws.addEventListener("open", () => {
      console.log("WebSocket connection opened");
    });

    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (
        ((message.type === "user_changed_group" ||
          message.type === "user_changed_username_password" ||
          message.type === "user_changed_role") &&
          message.data.id === user.id) ||
        (message.type === "user_changed_group" &&
          message.data.id === user.groupId)
      ) {
        // navigate to login
        removeCookie("user", { path: "/" });
        navigate("/login");
      }
      if (user.role !== "User") {
        if (message.type === "add") {
          setValues((prevValues) => [...prevValues, message.data]); // add the new data to the previous values
          notify(1, (prev) => prev + 1);
        } else if (message.type === "delete") {
          setValues((prevValues) =>
            prevValues.filter((data) => data.path !== message.data.path)
          );
          notify(2, (prev) => prev - 1);
        } else if (message.type === "statusOrReply_changed") {
          setValues((prevData) => {
            const updatedData = prevData.map((card) => {
              if (card.path === message.data.path) {
                return {
                  ...card,
                  info: message.data.info,
                  status: message.data.status,
                };
              }
              return card;
            });
            return updatedData;
          });
          notify(3, (prev) => prev + 1);
        } else {
          console.warn("Received unknown message type:", message.type);
        }
      } else {
        // When File Deleted (Hided) By Manager/Admin And This file was Attached to a User
        if (
          message.type === "user_file_delete" &&
          message.data.groupId === user.groupId
        ) {
          setValues((prevValues) =>
            prevValues.filter((data) => data.path !== message.data.path)
          );
          notify(5, (prev) => prev - 1);
        }
        // When File Is Deleted From OS And this file was attached to group users it will be removed
        if (
          message.type === "delete" &&
          message.data.groupId === user.groupId
        ) {
          setValues((prevValues) =>
            prevValues.filter((data) => data.path !== message.data.path)
          );
          notify(2, (prev) => prev - 1);
        }
        // When File Is Attached To User It Appears Immediately to this user
        if (
          message.type === "user_add" &&
          user.groupId === message.data.groupId &&
          message.data.groupId !== message.prevGroupID
        ) {
          setValues((prevValues) => [...prevValues, message.data]); // add the new data to the previous values
          notify(1, (prev) => prev + 1);
        }
        // When Manager/Admin Changed the group of file it deleted from the group users which had this file and added this file to the new group users
        else if (message.type === "user_delete_add") {
          if (message.data.groupId === user.groupId) {
            setValues((prevValues) => [...prevValues, message.data]); // add the new data to the previous values
            notify(1, (prev) => prev + 1);
          } else if (
            message.prevGroupID !== null &&
            message.prevGroupID === user.groupId
          ) {
            setValues((prevValues) =>
              prevValues.filter((data) => data.path !== message.data.path)
            );
            notify(4, (prev) => prev - 1);
          }
        }
      }
    });

    return () => {
      ws.close();
    };
  }, []);

  const fetchData = (searchQuery, page, pageSize) => {
    fetch(
      "http://localhost:9000/" + searchQuery + "/" + page + "/" + pageSize,
      {
        credentials: "include",
      }
    )
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
          const { allFiles, total } = await response.json();
          if (allFiles) {
            setValues(allFiles);
            setFilterData(allFiles);
            setTotal(total);
            if (!isToggled) setIsToggled(false);
          }
        }
      })
      .catch((error) => {
        removeCookie("user", { path: "/" });
        navigate("/login");
      });
  };
  // Handle The Change When Pressing Key In Search Bar To Filter Data
  const handleChange = (e) => {
    if (/^[0-9-]*$/.test(e.target.value)) {
      setInputValue(e.target.value);
    }
    if (e.target.value === "") {
      setPage(1);
      setPageSize(5);
      fetchData("*", page, pageSize);
    }
  };
  const handleEnterPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      if (inputValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [day, month, year] = inputValue.split("-");
        const date = year + "-" + month + "-" + day;
        setSearchQuery(date);
        setInputError(false);
      } else if (inputValue.match(/^0[0-9]{10}$/)) {
        setSearchQuery(inputValue);
        setInputError(false);
      } else {
        setInputValue("");
        setInputError(true);
      }
    }
  };
  const handleClickToggleButton = (event) => {
    event.preventDefault();
    setIsToggled((isToggled) => !isToggled);
    if (!isToggled) {
      // execute function when button is toggled on
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, "0");
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = currentDate.getFullYear();
      const formattedDate = `${year}-${month}-${day}`;
      setPage(1);
      setSearchQuery(formattedDate);
    } else {
      setPage(1);
      setSearchQuery("*");
    }
  };
  return (
    <>
      <FilterSearch
        user={user}
        handleClickToggleButton={handleClickToggleButton}
        inputValue={inputValue}
        handleChange={handleChange}
        handleEnterPress={handleEnterPress}
        isToggled={isToggled}
        isError={inputError}
      />
      <FilterCards
        user={user}
        data={filterData}
        pageSize={pageSize}
        page={page}
        total={total}
        setPage={setPage}
        setFilterData={setFilterData}
        setValues={setValues}
        notify={notify}
      />
      {total > pageSize && (
        <div className="pagination" style={{ justifyContent: "center" }}>
          <Pagination
            defaultCurrent={1}
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            }}
          />
        </div>
      )}
    </>
  );
};

export default React.memo(FilterBox);
