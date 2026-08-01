import { useState } from "react";
import StockTransferChallanList from "./StockTransferChallanList";
import StockTransferChallanForm from "./StockTransferChallanForm";

const StockTransferChallanMaster = () => {
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
        <StockTransferChallanList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}
      {screen === "form" && (
        <StockTransferChallanForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default StockTransferChallanMaster;