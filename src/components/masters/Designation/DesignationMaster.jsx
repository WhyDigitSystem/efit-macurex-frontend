import { useState } from "react";
import DesignationListView from "./DesignationListView";
import DesignationMasterForm from "./DesignationForm";

const DesignationMasterPage = () => {
    const [screen, setScreen] = useState("list");
    const [editData, setEditData] = useState(null);
    const [editId, setEditId] = useState(null);

    const handleAddNew = () => {
        setEditData(null);
        setEditId(null);
        setScreen("form");
    };

    const handleEdit = (data) => {
        setEditData(data);
        setEditId(data.id);
        setScreen("form");
    };

    const handleBack = () => {
        setScreen("list");
        setEditData(null);
        setEditId(null);
    };

    const handleSave = (savedData) => {
        // Refresh the list after saving
        handleBack();
    };

    return (
        <>
            {screen === "list" && (
                <DesignationListView
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <DesignationMasterForm
                    editData={editData}
                    editId={editId}
                    onBack={handleBack}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default DesignationMasterPage;