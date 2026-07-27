import { useState } from "react";
import TaxRateList from "./TaxRateList";
import TaxRateForm from "./TaxRateForm";

const TaxRateMaster = () => {
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
        <TaxRateList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <TaxRateForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default TaxRateMaster;