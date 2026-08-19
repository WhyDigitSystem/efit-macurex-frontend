import { useState } from "react";
import SalesInvoiceList from "./SalesInvoiceList";
import SalesInvoiceForm from "./SalesInvoiceForm";

const SalesInvoiceMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (data) => {
    setEditData(data);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
  };

  const handleSave = async (payload) => {
    try {
      await salesInvoiceAPI.updateCreateSalesInvoice(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving sales invoice:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <SalesInvoiceList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <SalesInvoiceForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default SalesInvoiceMaster;
