import { useState } from "react";
import SalesDeliveryList from "./SalesDeliveryList";
import SalesDeliveryForm from "./SalesDeliveryForm";

const SalesDelivery = () => {
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
        <SalesDeliveryList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <SalesDeliveryForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default SalesDelivery;