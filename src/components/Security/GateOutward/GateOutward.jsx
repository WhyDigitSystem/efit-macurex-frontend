import { useState } from "react";
import GateOutwardList from "./GateOutwardList";
import GateOutwardForm from "./GateOutwardForm";

const GateOutward = () => {
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
      const serialNo = `GO-${String(prev.length + 1).padStart(4, "0")}`;
      const newRecord = { ...record, id: Date.now(), serialNo };
      return [newRecord, ...prev];
    });
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <GateOutwardList
          data={entries}
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <GateOutwardForm
          data={editData}
          nextSerialNo={`GO-${String(entries.length + 1).padStart(4, "0")}`}
          onBack={() => setScreen("list")}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default GateOutward;
