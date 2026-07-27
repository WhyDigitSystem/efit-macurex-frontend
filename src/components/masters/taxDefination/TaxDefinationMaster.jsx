import { useState } from "react";
import TaxDefinationList from "./TaxDefinationList";
import TaxDefinationForm from "./TaxDefinationForm";

const TaxDefinationMaster = () => {
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
        <TaxDefinationList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <TaxDefinationForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default TaxDefinationMaster;