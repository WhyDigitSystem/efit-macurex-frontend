import { useState } from "react";
import ProformaInvoiceForm from "./ProformaInvoiceForm";
import ProformaInvoiceList from "./ProformaInvoiceList";

const ProformaInvoice = () => {
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
        <ProformaInvoiceList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ProformaInvoiceForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default ProformaInvoice;