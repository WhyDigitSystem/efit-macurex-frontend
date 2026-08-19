import { useState } from "react";
import DocTypeMasterList from "./DocTypeMasterList";
import DocTypeMasterForm from "./DocTypeMasterForm";

const DocTypeMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editId, setEditId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditId(null);
    setScreen("form");
  };

  // row comes from the table; we only need its id — the form fetches
  // the full record via getDocumentTypeMasterById.
  const handleEdit = (row) => {
    setEditId(row?.id);
    setScreen("form");
  };

  const handleBack = () => {
    setEditId(null);
    setScreen("list");
  };

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleBack();
  };

  return (
    <>
      {screen === "list" && (
        <DocTypeMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <DocTypeMasterForm
          editId={editId}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default DocTypeMaster;
