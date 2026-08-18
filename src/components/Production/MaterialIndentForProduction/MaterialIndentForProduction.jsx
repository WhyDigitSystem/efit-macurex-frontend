import { useState } from "react";
import MaterialIndentForProductionList from "./MaterialIndentForProductionList";
import MaterialIndentForProductionForm from "./MaterialIndentForProductionForm";

const MaterialIndentForProduction = () => {
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
                <MaterialIndentForProductionList
                    onAddNew={addNew}
                    onEdit={edit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <MaterialIndentForProductionForm
                    data={editData}
                    onBack={() => setScreen("list")}
                />
            )}
        </>
    );
};

export default MaterialIndentForProduction;