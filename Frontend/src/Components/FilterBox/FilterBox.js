import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import FilterSearch from "../FilterSearch/FilterSearch";
import FilterCards from "../FilterCards/FilterCards";
import { useCookies } from "react-cookie";
const FilterBox = ({ user, notify }) => {
  const navigate = useNavigate();
  const [values, setValues] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [eventAction, setEventAction] = useState();
  const [, , removeCookie] = useCookies(["user"]);
  const [isToggled, setIsToggled] = useState(false);
  useEffect(() => {
    fetch("http://128.36.1.71:9000/", {
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
          if (data) {
            setValues(data);
            setFilterData(data);
            setIsToggled(false);
          }
        }
      })
      .catch((error) => {
        removeCookie("user", { path: "/" });
        navigate("/login");
      });
  }, []);
  // Get Data From Database And Use WebSocket To Listen When File Added Or Deleted
  useEffect(() => {
    const ws = new WebSocket("ws://128.36.1.71:9099");

    ws.addEventListener("open", () => {
      console.log("WebSocket connection opened");
    });

    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (
        (message.type === "user_changed_group" ||
          message.type === "user_changed_role") &&
        message.data.id === user.id
      ) {
        // navigate to login
        removeCookie("user", { path: "/" });
        navigate("/login");
      }
      if (user.role !== "User") {
        // if(message.type === 'user_file_delete'){
        //   setFilterData((prevValues) => prevValues.filter(data => data.path !== message.data.path));
        //   console.log(filterData);
        //   notify(2, prev => prev - 1)
        // }

        if (message.type === "add") {
          setValues((prevValues) => [...prevValues, message.data]); // add the new data to the previous values
          notify(1, (prev) => prev + 1);
        } else if (message.type === "delete") {
          console.log(message.data.path);
          setValues((prevValues) =>
            prevValues.filter((data) => data.path !== message.data.path)
          );
          console.log(filterData);
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
          console.log(filterData);
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

  // Filter Data When Values Changes Or Press Any Key In Search Bar
  useEffect(() => {
    if (!eventAction) {
      setFilterData(values);
    } else {
      const filter = values.filter((data) =>
        data.path.toLowerCase().includes(eventAction)
      );
      setFilterData(filter);
    }
  }, [values, eventAction]);

  // Handle The Change When Pressing Key In Search Bar To Filter Data
  const handleChange = (event) => {
    const filter = values.filter((data) =>
      data.path.toLowerCase().includes(event.target.value)
    );
    setEventAction(event.target.value);
    setFilterData(filter);
    console.log(filter);
  };

  return (
    <>
      <FilterSearch
        user={user}
        handleChange={handleChange}
        setValues={setValues}
        setFilterData={setFilterData}
        setIsToggled={setIsToggled}
        isToggled={isToggled}
      />
      <FilterCards
        user={user}
        data={filterData}
        setFilterData={setFilterData}
        setValues={setValues}
        notify={notify}
      />
    </>
  );
};

export default React.memo(FilterBox);
