import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import FilterSearch from "../FilterSearch/FilterSearch";
import FilterCards from "../FilterCards/FilterCards";
import { useCookies } from "react-cookie";
import { Pagination } from "antd";
import SpinnerComponent from "../CommonComponents/Spinner";
import RefreshButton from "../CommonComponents/RefreshButton";
const APP_API_URL = process.env.REACT_APP_API_URL;
const APP_WEBSOCKET_URL = process.env.WEBSOCKET_URL;
const FilterBox = ({ user, notify }) => {
  const navigate = useNavigate();
  const [values, setValues] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState(false);
  const [, , removeCookie] = useCookies(["user"]);
  const [selectedStatusValue, setSelectedStatusValue] = useState(undefined);
  const [total, setTotal] = useState(-1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("*");
  const [filterByStatus, setFilterByStatus] = useState(null);
  const [firstTime, setFirstTime] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pageIsEmpty, setPageIsEmpty] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [filterByGroup, setFilterByGroup] = useState(null);
  useEffect(() => {
    fetchData(filterByStatus, searchQuery, filterByGroup, page, pageSize);
  }, [searchQuery, filterByStatus, filterByGroup, page, pageSize]);

  // Get Data From Database And Use WebSocket To Listen When File Added Or Deleted
  useEffect(() => {
    const ws = new WebSocket(`ws://${APP_WEBSOCKET_URL}`);

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
          setFilterData((prevValues) => [...prevValues, message.data]); // add the new data to the previous values
          setTotal((prev) => prev + 1);
          notify(1, (prev) => prev + 1);
        } else if (message.type === "delete") {
          setFilterData((prevValues) =>
            prevValues.filter((data) => data.path !== message.data.path)
          );
          if (total <= pageSize && total > 0) {
            window.location.reload();
          } else {
            setTotal((prev) => prev - 1);
          }
          notify(2, (prev) => prev - 1);
        } else if (message.type === "statusOrReply_changed") {
          setFilterData((prevData) => {
            const updatedData = prevData.map((card) => {
              if (card.path === message.data.path) {
                return {
                  ...card,
                  repliedBy: message.data.repliedBy,
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
          setFilterData((prevValues) =>
            prevValues.filter((data) => data.path !== message.data.path)
          );
          if (total <= pageSize && total > 0) {
            window.location.reload();
          } else {
            setTotal((prev) => prev - 1);
          }
          notify(5, (prev) => prev - 1);
        }
        // When File Is Deleted From OS And this file was attached to group users it will be removed
        if (
          message.type === "delete" &&
          message.data.groupId === user.groupId
        ) {
          setFilterData((prevValues) =>
            prevValues.filter((data) => data.path !== message.data.path)
          );
          if (total <= pageSize && total > 0) {
            window.location.reload();
          } else {
            setTotal((prev) => prev - 1);
          }
          notify(2, (prev) => prev - 1);
        }
        // When File Is Attached To User It Appears Immediately to this user
        if (
          message.type === "user_add" &&
          user.groupId === message.data.groupId &&
          message.data.groupId !== message.prevGroupID
        ) {
          setFilterData((prevValues) => [...prevValues, message.data]); // add the new data to the previous values
          setTotal((prev) => prev + 1);
          notify(1, (prev) => prev + 1);
        }
        // When Manager/Admin Changed the group of file it deleted from the group users which had this file and added this file to the new group users
        else if (message.type === "user_delete_add") {
          if (message.data.groupId === user.groupId) {
            setFilterData((prevValues) => [...prevValues, message.data]); // add the new data to the previous values
            setTotal((prev) => prev + 1);
            notify(1, (prev) => prev + 1);
          } else if (
            message.prevGroupID !== null &&
            message.prevGroupID === user.groupId
          ) {
            setFilterData((prevValues) =>
              prevValues.filter((data) => data.path !== message.data.path)
            );
            if (total <= pageSize && total > 0) {
              window.location.reload();
            } else {
              setTotal((prev) => prev - 1);
            }
            notify(4, (prev) => prev - 1);
          }
        }
      }
    });

    return () => {
      ws.close();
    };
  }, []);
  useEffect(() => {
    if (firstTime) {
      setFirstTime(false);
      return;
    }
    setPageIsEmpty(false);
    if (filterData.length === 0 && !firstTime && total === 0) {
      setPageIsEmpty(true);
    } else if (filterData.length === 0 && !firstTime && total !== -1) {
      window.location.reload();
    } else if (filterData.length > pageSize) {
      setFilterData((prevFilterData) => {
        const sortedData = [...prevFilterData].sort(
          (a, b) => new Date(b.fileDate) - new Date(a.fileDate)
        );
        const truncatedData = sortedData.slice(0, pageSize);
        return truncatedData;
      });
    }
  }, [filterData]);
  useEffect(() => {
    fetch(`${APP_API_URL}groups`, {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("You are not authenticated");
          } else {
            throw new Error("Error fetching data");
          }
        }

        const data = await response.json();
        if (data) {
          setGroups(data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  const fetchData = (
    filterByStatus,
    searchQuery,
    filterByGroup,
    page,
    pageSize
  ) => {
    setLoading(true);
    fetch(
      APP_API_URL +
        filterByStatus +
        "/" +
        filterByGroup +
        "/" +
        encodeURIComponent(searchQuery) +
        "/" +
        page +
        "/" +
        pageSize,
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
          }
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        removeCookie("user", { path: "/" });
        navigate("/login");
      });
  };
  // Handle The Change When Pressing Key In Search Bar To Filter Data
  const handleChange = (e) => {
    if (/^[0-9-#]*$/.test(e.target.value)) {
      setInputValue(e.target.value);
    }
    if (e.target.value === "") {
      setPage(1);
      setPageSize(10);
      setSearchQuery("*");
    }
  };
  const handleEnterPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      if (inputValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [day, month, year] = inputValue.split("-");
        const date = year + "-" + month + "-" + day;
        setPage(1);
        setSearchQuery(date);
        setInputError(false);
      } else if (
        inputValue.match(/^[0-9]*$/) ||
        inputValue.match(/^#[0-9]*$/)
      ) {
        setPage(1);
        setSearchQuery(inputValue);
        setInputError(false);
      } else {
        setInputValue("");
        setInputError(true);
      }
    }
  };

  const handleStatusFiltration = (value) => {
    setSelectedStatusValue(value);
    if (value === undefined) {
      setPage(1);
      setFilterByStatus(null);
      setSearchQuery("*");
    } else if (value === "ON_TODAY") {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, "0");
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = currentDate.getFullYear();
      const formattedDate = `${year}-${month}-${day}`;
      setPage(1);
      setFilterByStatus(null);
      setSearchQuery(formattedDate);
    } else {
      setPage(1);
      setFilterByStatus(value);
      setSearchQuery("*");
    }
  };
  const handleGroupFiltration = (value) => {
    setSelectedGroup(value);
    if (value === undefined) {
      setPage(1);
      setFilterByGroup(null);
      setSearchQuery("*");
    } else {
      setPage(1);
      setFilterByGroup(value);
      setSearchQuery("*");
    }
  };

  return (
    <>
      <FilterSearch
        user={user}
        inputValue={inputValue}
        handleChange={handleChange}
        handleEnterPress={handleEnterPress}
        selectedStatusValue={selectedStatusValue}
        handleStatusFiltration={handleStatusFiltration}
        groups={groups}
        handleGroupFiltration={handleGroupFiltration}
        selectedGroup={selectedGroup}
        isError={inputError}
      />
      {loading ? (
        <>
          <SpinnerComponent variant="primary" />
        </>
      ) : (
        <>
          {pageIsEmpty ? (
            <div className="no-data text-center">
              <h1>لا توجد بيانات في هذه الصفحة الرجاء قم بعمل تحديث للصفحة</h1>
              <RefreshButton
                message={"تحديث"}
                color={"primary"}
                handleClick={() => window.location.reload()}
              />
            </div>
          ) : (
            <>
              {" "}
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
            </>
          )}

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
      )}
    </>
  );
};

export default React.memo(FilterBox);
