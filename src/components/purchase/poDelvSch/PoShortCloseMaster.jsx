import { useState } from "react";
import PoShortCloseForm from "./PoShortCloseForm";
import PoShortCloseListView from "./PoShortCloseListView";

const PoShortCloseMaster = () => {
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
                <PoShortCloseListView
                    onAddNew={addNew}
                    onEdit={edit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <PoShortCloseForm
                    data={editData}
                    onBack={handleBack}
                />
            )}
        </>
    );
};

export default PoShortCloseMaster;