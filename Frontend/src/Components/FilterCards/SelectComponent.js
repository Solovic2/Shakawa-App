import React, { useState } from 'react';

const SelectComponent = ({ element, groups, onSelectChange, edit }) => {
  const [selection, setSelection] = useState(element.groupId !== null ? element.groupId : '');

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelection(selectedValue);
    onSelectChange(selectedValue); // Call the callback function
  };

  return (
    <select
      value={selection}
      onChange={handleSelectChange}
      disabled = {selection !== '' && !edit}
      required
    >
      <option value="">-- أختر القسم --</option>
      {groups.map((groupElement) => (
        <option key={groupElement.id} value={groupElement.id}>
          {groupElement.name}
        </option>
      ))}
    </select>
  );
};
export default SelectComponent;