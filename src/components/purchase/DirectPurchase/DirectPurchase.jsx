import { useState } from "react";
import DirectPurchaseList from "./DirectPurchaseList";
import DirectPurchaseForm from "./DirectPurchaseForm";

const DirectPurchase = () => {
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
                <DirectPurchaseList
                    onAddNew={addNew}
                    onEdit={edit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <DirectPurchaseForm
                    data={editData}
                    onBack={handleBack}
                />
            )}
        </>
    );
};

export default DirectPurchase;