// MachineToolBreakdownMaster.jsx
import { useState } from "react";
import MachineToolBreakdownList from "./MachineToolBreakdownList";
import MachineToolBreakdownForm from "./MachineToolBreakdownForm";

const MachineToolBreakdownMaster = () => {
    const [screen, setScreen] = useState("list");
    const [editData, setEditData] = useState(null);

    const addNew = () => {
        console.log("Add button clicked");
        setEditData(null);
        setScreen("form");
    };

    const edit = (row) => {
        console.log("Edit clicked:", row);
        setEditData(row);
        setScreen("form");
    };

    const handleBack = () => {
        setScreen("list");
    };

    return (
        <>
            {screen === "list" && (
                <MachineToolBreakdownList
                    onAddNew={addNew}
                    onEdit={edit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <MachineToolBreakdownForm
                    data={editData}
                    onBack={handleBack}
                />
            )}
        </>
    );
};

export default MachineToolBreakdownMaster;