import { useState } from "react";
import MachineMasterForm from "./MachineMasterForm";
import MachineMasterList from "./MachineMasterList";

const MachineMaster = () => {
    const [screen, setScreen] = useState("list");
    const [editData, setEditData] = useState(null);
    const [editId, setEditId] = useState(null);

    const handleAddNew = () => {
        setEditData(null);
        setEditId(null);
        setScreen("form");
    };

    const handleEdit = (row) => {
        setEditId(row.id);
        setEditData(null); // Don't pass data, let form fetch by ID
        setScreen("form");
    };

    const handleBack = () => {
        setScreen("list");
        setEditData(null);
        setEditId(null);
    };

    const handleSave = () => {
        handleBack();
    };

    return (
        <>
            {screen === "list" && (
                <MachineMasterList
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <MachineMasterForm
                    editId={editId}
                    editData={editData}
                    onBack={handleBack}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default MachineMaster;