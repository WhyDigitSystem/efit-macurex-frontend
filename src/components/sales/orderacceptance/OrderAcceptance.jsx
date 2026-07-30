import { useState } from "react";
import OrderAcceptanceForm from "./OrderAcceptanceForm";
import OrderAcceptanceList from "./OrderAcceptanceList";

const OrderAcceptance = () => {
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
        <OrderAcceptanceList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <OrderAcceptanceForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default OrderAcceptance;