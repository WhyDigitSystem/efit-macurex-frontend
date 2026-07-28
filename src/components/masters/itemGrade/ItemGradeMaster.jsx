import { useState } from "react";
import ItemGradeMasterList from "./ItemGradeMasterList";
import ItemGradeMasterForm from "./ItemGradeMasterForm";

const ItemGradeMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const addNew = () => {
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
        <ItemGradeMasterList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}
      {screen === "form" && (
        <ItemGradeMasterForm
          editData={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default ItemGradeMaster;
