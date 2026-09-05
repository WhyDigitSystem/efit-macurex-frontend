import { useState } from "react";
import OtherSalesInvoiceList from "./OtherSalesInvoiceList";
import OtherSalesInvoiceForm from "./OtherSalesInvoiceForm";
 
const OtherSalesInvoiceMasterScreen = () => {
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
        <OtherSalesInvoiceList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}
      {screen === "form" && (
        <OtherSalesInvoiceForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default OtherSalesInvoiceMasterScreen;

