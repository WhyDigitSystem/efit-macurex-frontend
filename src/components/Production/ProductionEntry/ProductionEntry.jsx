import { useState } from "react";
import ProductionEntryList from "./ProductionEntryList";
import ProductionEntryForm from "./ProductionEntryForm";

const ProductionEntry = () => {
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
                <ProductionEntryList
                    onAddNew={addNew}
                    onEdit={edit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <ProductionEntryForm
                    data={editData}
                    onBack={() => setScreen("list")}
                />
            )}
        </>
    );
};

export default ProductionEntry;