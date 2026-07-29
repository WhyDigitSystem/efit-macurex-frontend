import { useState } from "react";
import StockTransferGRNList from "./StockTransferGRNList";
import StockTransferGRNForm from "./StockTransferGRNForm";

const StockTransferGRNMaster = () => {
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
        <StockTransferGRNList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}
      {screen === "form" && (
        <StockTransferGRNForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default StockTransferGRNMaster;
