import { useState } from "react";
import LCDeliveryScheduleList from "./LCDeliveryScheduleList";
import LCDeliveryScheduleForm from "./LCDeliveryScheduleForm";

const LCDeliverySchedule = () => {
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
        <LCDeliveryScheduleList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <LCDeliveryScheduleForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default LCDeliverySchedule;
