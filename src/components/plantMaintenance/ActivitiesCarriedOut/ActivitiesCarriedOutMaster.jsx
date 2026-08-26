// ActivitiesCarriedOutMaster.jsx
import { useState } from "react";
import ActivitiesCarriedOutForm from "./ActivitiesCarriedOutForm";
import ActivitiesCarriedOutList from "./ActivitiesCarriedOutList";

const ActivitiesCarriedOutMaster = () => {
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
                <ActivitiesCarriedOutList
                    onAddNew={addNew}
                    onEdit={edit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <ActivitiesCarriedOutForm
                    data={editData}
                    onBack={handleBack}
                />
            )}
        </>
    );
};

export default ActivitiesCarriedOutMaster;