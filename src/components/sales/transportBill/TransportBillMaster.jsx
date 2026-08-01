import { useState } from "react";
import TransportBillList from "./TransportBillList";
import TransportBillForm from "./TransportBillForm";

const TransportBillMaster = () => {
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
        <TransportBillList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}
      {screen === "form" && (
        <TransportBillForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default TransportBillMaster;
