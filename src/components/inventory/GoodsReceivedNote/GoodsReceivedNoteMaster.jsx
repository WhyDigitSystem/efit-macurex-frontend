import { useState } from "react";
import GoodsReceivedNoteList from "./GoodsReceivedNoteList";
import GRNForm from "./GRNForm";

const GoodsReceivedNoteMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (row) => {
    // Pass only the id — the form fetches the full record by itself
    setEditData({ id: row?.id });
    setScreen("form");
  };

  const handleBack = () => {
    setEditData(null);
    setScreen("list");
  };

  const handleSave = () => {
    // The form already calls updateCreateGrn; nothing else to do
    handleBack();
  };

  return (
    <>
      {screen === "list" && (
        <GoodsReceivedNoteList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <GRNForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default GoodsReceivedNoteMaster;