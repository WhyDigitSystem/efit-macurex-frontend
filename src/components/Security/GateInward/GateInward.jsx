import { useState } from "react";
import GateInwardList from "./GateInwardList";
import GateInwardForm from "./GateInwardForm";

const GateInward = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  // No API — entries just live in local state for now.
  const [entries, setEntries] = useState([]);

  const addNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const edit = (row) => {
    setEditData(row);
    setScreen("form");
  };

  const handleSave = (record) => {
    setEntries((prev) => {
      if (record.id) {
        return prev.map((e) => (e.id === record.id ? record : e));
      }
      const newRecord = { ...record, id: Date.now() };
      return [newRecord, ...prev];
    });
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <GateInwardList
          data={entries}
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <GateInwardForm
          data={editData}
          onBack={() => setScreen("list")}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default GateInward;
