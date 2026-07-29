import { useState } from "react";
import ImportGRNList from "./ImportGRNList";
import ImportGRNForm from "./ImportGRNForm";

const ImportGRNMaster = () => {
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
        <ImportGRNList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ImportGRNForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default ImportGRNMaster;
