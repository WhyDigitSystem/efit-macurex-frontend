import { useState } from "react";
import ReconcileConsumptionStockList from "./reconcileConsumptionStockList";
import ReconcileConsumptionStockForm from "./reconcileConsumptionStockForm";
import reconcileConsumptionStockAPI from "../../../api/Production/reconcileConsumptionStockAPI";

const ReconcileConsumptionStock = () => {
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
            await reconcileConsumptionStockAPI.createUpdateReconcileConsumption(payload);
            handleBack();
        } catch (error) {
            console.error("Error saving:", error);
            throw error;
        }
    };

    return (
        <>
            {screen === "list" && (
                <ReconcileConsumptionStockList
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <ReconcileConsumptionStockForm
                    editId={editId}
                    editData={editData}
                    onBack={handleBack}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default ReconcileConsumptionStock;