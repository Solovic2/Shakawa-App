import React, { useState } from "react";

const SelectComponent = ({
  element,
  groups,
  status,
  onSelectChange,
  edit,
  isManager
}) => {
  const statusOrGroups = groups
    ? element.groupId !== null
      ? element.groupId
      : ""
    : element.info !== ""
    ? element.status
    : "";
  const [selection, setSelection] = useState(statusOrGroups);
  let disabled = true;
  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelection(selectedValue);
    onSelectChange(selectedValue); // Call the callback function
  };

  let statusValues = [];
  if (status) {
    for (let i = 0; i < status.length; i++) {
      switch (status[i]) {
        case "ON_UNSEEN":
          // statusBadge = "badge text-bg-danger"
          statusValues.push(
            element.fileType === "txt" ? "لم تقرأ بعد" : "لم تسمع بعد"
          );
          break;
        case "ON_HOLD":
          // statusBadge = "badge text-bg-warning"
          statusValues.push("جاري الدراسة");
          break;
        case "ON_SOLVE":
          // statusBadge = "badge bg-success"
          statusValues.push("تم الحل والتواصل");
          break;
        default:
          statusValues.push(
            element.fileType === "txt" ? "لم تقرأ بعد" : "لم تسمع بعد"
          );
          break;
      }
    }
  }

  if (groups) {
    disabled = element.groupId !== null;
  } else {
    disabled = element.info !== "";
  }
  return (
    <select
      value={selection}
      onChange={handleSelectChange}
      disabled={disabled && (edit ? !edit : true)}
      style={
        disabled && (edit ? !edit : true)
          ? { backgroundColor: "#ccc", fontWeight: "bold" , width : isManager ? "90%" :""}
          : {}
      }
      required
      onInvalid={
        groups
          ? (e) => e.target.setCustomValidity("برجاء اختيار القسم")
          : (e) => e.target.setCustomValidity("برجاء اختيار حالة الطلب")
      }
    >
      {groups ? (
        <>
          <option value="">-- أختر القسم --</option>
          {groups?.map((groupElement) => (
            <option key={groupElement.id} value={groupElement.id}>
              {groupElement.name}
            </option>
          ))}
        </>
      ) : (
        <>
          <option value="">-- أختر حالة الطلب --</option>
          {statusValues?.map((element, index) => {
            return (
              <option key={index} value={status[index]}>
                {element}
              </option>
            );
          })}
        </>
      )}
    </select>
  );
};
export default React.memo(SelectComponent);
