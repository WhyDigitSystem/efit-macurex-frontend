import { useState } from "react";
import UserCreationList from "./UserCreationList";
import UserCreationForm from "./UserCreationForm";

const UserCreation = () => {
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
                <UserCreationList
                    onAddNew={addNew}
                    onEdit={edit}
                    onBack={() => window.history.back()}
                />
            )}

            {screen === "form" && (
                <UserCreationForm
                    data={editData}
                    onBack={handleBack}
                />
            )}
        </>
    );
};

export default UserCreation;