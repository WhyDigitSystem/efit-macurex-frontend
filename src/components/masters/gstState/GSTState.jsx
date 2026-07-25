import { useState } from "react";

import GSTStateList from "../gstState/GSTStateList";
import GSTStateForm from "../gstState/GSTStateForm";

const GSTState = () => {
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
        <GSTStateList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <GSTStateForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default GSTState;