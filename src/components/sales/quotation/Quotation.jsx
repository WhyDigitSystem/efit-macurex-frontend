import { useState } from "react";
import QuotationList from "./QuotationList";
import QuotationForm from "./Quotation.Form";

const Quotation = () => {
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
        <QuotationList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <QuotationForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default Quotation;