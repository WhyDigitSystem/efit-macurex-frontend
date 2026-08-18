import { useState } from "react";
import ProductionTransferSlipList from "./ProductionTransferSlipList";
import ProductionTransferSlipForm from "./ProductionTransferSlipForm";

const ProductionTransferSlip = () => {
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
                <ProductionTransferSlipList
                    onAddNew={addNew}
                    onEdit={edit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <ProductionTransferSlipForm
                    data={editData}
                    onBack={() => setScreen("list")}
                />
            )}
        </>
    );
};

export default ProductionTransferSlip;