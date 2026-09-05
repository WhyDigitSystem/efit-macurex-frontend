import { useState } from "react";
import toolCategoryAPI from "../../../api/Production/toolCategoryAPI";
import ToolCategoryList from "./ToolCategoryList";
import ToolCategoryForm from "./ToolCategoryForm";

const ToolCategoryMaster = () => {
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

    // Remove the API call from here - let the form handle it
    const handleSave = (payload) => {
        // Just handle the navigation/state after save
        handleBack();
    };

    return (
        <>
            {screen === "list" && (
                <ToolCategoryList
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <ToolCategoryForm
                    editId={editId}
                    editData={editData}
                    onBack={handleBack}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default ToolCategoryMaster;