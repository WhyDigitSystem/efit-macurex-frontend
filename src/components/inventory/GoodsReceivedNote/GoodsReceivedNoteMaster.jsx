import { useState } from "react";
import GoodsReceivedNoteList from "./GoodsReceivedNoteList";
import GoodsReceivedNoteForm from "./GoodsReceivedNoteForm";
import goodsReceivedNoteAPI from "../../../api/Inventory/goodsReceivedNoteAPI";

const GoodsReceivedNoteMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (data) => {
    setEditData(data);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
  };

  const handleSave = async (payload) => {
    try {
      await goodsReceivedNoteAPI.updateCreateGrn(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving GRN:", error);
      throw error;
    }
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
        <GoodsReceivedNoteForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default GoodsReceivedNoteMaster;
