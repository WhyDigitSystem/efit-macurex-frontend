import { useState } from "react";
import EmployeeMasterList from "./EmployeeMasterList";
import EmployeeMasterForm from "./EmployeeMasterform";

const EmployeeMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const addNew = () => {
    console.log("Add button clicked");
    setEditData(null);
    setScreen("form");
  };

  const edit = (row) => {
    setEditData(row);
    setScreen("form");
  };

  return (
    <>
      {screen === "list" && (
        <EmployeeMasterList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <EmployeeMasterForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default EmployeeMaster;