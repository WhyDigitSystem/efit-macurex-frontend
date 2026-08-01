import { useState } from "react";
import DocketInvoiceDetailsList from "./DocketInvoiceDetailsList";
import DocketInvoiceDetailsForm from "./DocketInvoiceDetailsForm";

const DocketInvoiceDetailsMaster = () => {
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
        <DocketInvoiceDetailsList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}
      {screen === "form" && (
        <DocketInvoiceDetailsForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default DocketInvoiceDetailsMaster;
