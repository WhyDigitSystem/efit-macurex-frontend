import { useState } from "react";
import LCInvoiceList from "./LCInvoiceList";
import LCInvoiceForm from "./LCInvoiceForm";

const LCInvoice = () => {
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

  const handleBack = () => {
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <LCInvoiceList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <LCInvoiceForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default LCInvoice;
