import { useState } from "react";
import SalesInvoiceList from "./SalesInvoiceList";
import SalesInvoiceForm from "./SalesInvoiceForm";
import salesInvoiceAPI from "../../../api/Sales/salesInvoiceAPI";

const SalesInvoiceMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [editId, setEditId] = useState(null);

  const handleAddNew = () => {
    setEditData(null);
    setEditId(null);
    setScreen("form");
  };

  const handleEdit = (data) => {
    // Store the ID from the list data
    setEditId(data.id);
    // Optionally keep the list data for quick display
    setEditData(data);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
    setEditData(null);
    setEditId(null);
  };

  const handleSave = async (payload) => {
    try {
      await salesInvoiceAPI.createUpdateSalesInvoice(payload);
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
          editId={editId}        // ← PASS THE ID HERE
          editData={editData}    // ← Keep this as fallback
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default SalesInvoiceMaster;