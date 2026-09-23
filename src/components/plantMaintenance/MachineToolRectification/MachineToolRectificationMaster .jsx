import { useState } from "react";
import MachineToolRectificationList from "./MachineToolRectificationList";
import MachineToolRectificationForm from "./MachineToolRectificationForm";

/**
 * Screen-state holder only. The Form component itself calls
 * updateCreateMachineToolRectification and only invokes onSave() after a
 * successful save purely to flip the screen back to the list - Master must
 * NOT call the save API again here (that caused the duplicate-save bug on
 * Internal Indent).
 */
const MachineToolRectificationMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const handleSave = () => {
    // Save already happened inside the Form. Just go back to the list
    // and bump refreshTrigger so it re-fetches instead of showing stale rows.
    setRefreshTrigger((prev) => prev + 1);
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <MachineToolRectificationList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <MachineToolRectificationForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default MachineToolRectificationMaster;
