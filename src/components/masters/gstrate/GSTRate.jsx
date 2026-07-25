import { useState } from "react";

import GSTRateList from "../gstrate/GSTRateList";
import GSTRateForm from "../gstrate/GSTRateForm";

const GSTRate = () => {
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
        <GSTRateList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <GSTRateForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default GSTRate;