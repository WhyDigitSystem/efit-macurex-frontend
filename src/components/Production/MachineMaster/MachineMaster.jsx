import { useState } from "react";
import machineMasterAPI from "../../../api/Production/machineMasterAPI";
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

    const handleEdit = (data) => {
        setEditId(data.id);
        setEditData(data);
        setScreen("form");
    };

    const handleBack = () => {
        setScreen("list");
        setEditData(null);
        setEditId(null);
    };

    const handleSave = async (payload) => {
        try {
            await machineMasterAPI.createUpdateMachineMaster(payload);
            handleBack();
        } catch (error) {
            console.error("Error saving:", error);
            throw error;
        }
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