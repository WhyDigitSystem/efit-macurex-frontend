import { useState } from "react";
import EnquiryList from "./EnquiryList";
import EnquiryForm from "./EnquiryForm";

const Enquiry = () => {
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
        <EnquiryList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <EnquiryForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default Enquiry;