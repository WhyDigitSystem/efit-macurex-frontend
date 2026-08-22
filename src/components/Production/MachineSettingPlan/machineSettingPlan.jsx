import { useState } from "react";
import MachineSettingPlanList from "./MachineSettingPlanList";
import MachineSettingPlanForm from "./MachineSettingPlanForm";
import machineSettingPlanAPI from "../../../api/Production/machineSettingPlanAPI";

const MachineSettingPlan = () => {
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
            await machineSettingPlanAPI.createUpdateMachineSettingPlan(payload);
            handleBack();
        } catch (error) {
            console.error("Error saving:", error);
            throw error;
        }
    };

    return (
        <>
            {screen === "list" && (
                <MachineSettingPlanList
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <MachineSettingPlanForm
                    editId={editId}
                    editData={editData}
                    onBack={handleBack}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default MachineSettingPlan;