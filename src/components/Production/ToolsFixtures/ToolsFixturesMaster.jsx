import { useState } from "react";
import ToolsFixturesList from "./ToolsFixturesList";
import ToolsFixturesForm from "./ToolsFixturesForm";

const ToolsFixturesMaster = () => {
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
        <ToolsFixturesList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ToolsFixturesForm data={editData} onBack={() => setScreen("list")} />
      )}
    </>
  );
};

export default ToolsFixturesMaster;
