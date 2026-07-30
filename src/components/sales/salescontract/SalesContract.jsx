import { useState } from "react";
import SalesContractForm from "./SalesContractForm";
import SalesContractList from "./SalesContractList";

const SalesContract = () => {
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
        <SalesContractList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <SalesContractForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default SalesContract;