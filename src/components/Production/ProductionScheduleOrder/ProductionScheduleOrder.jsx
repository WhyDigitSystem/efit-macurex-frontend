import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductionScheduleOrderForm from "./ProductionScheduleOrderForm";
import ProductionScheduleOrderList from "./ProductionScheduleOrderList";
import productionScheduleOrderAPI from "../../../api/Production/productionScheduleOrderAPI";
// import { toast } from "../../../utils/toast";

const ProductionScheduleOrder = () => {
    const navigate = useNavigate();
    const [screen, setScreen] = useState("list");
    const [editData, setEditData] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const ORG_ID = localStorage.getItem("orgId");
    const BRANCH_ID = localStorage.getItem("branchId");

    const addNew = () => {
        setEditData(null);
        setScreen("form");
    };

    const edit = useCallback(
        async (row) => {
            try {
                const fresh = await productionScheduleOrderAPI.getProductionScheduleOrderById(row.id) || row;
                setEditData(fresh);
                setScreen("form");
            } catch (error) {
                console.error("Failed to fetch production schedule order for edit:", error);
                // toast.error("Failed to load Production Schedule Order details");
            }
        },
        []
    );

    const handleBack = () => {
        setEditData(null);
        setScreen("list");
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleNavigateHome = () => {
        navigate("/Production");
    };

    return (
        <>
            {screen === "list" && (
                <ProductionScheduleOrderList
                    onAddNew={addNew}
                    onEdit={edit}
                    onBack={handleNavigateHome}
                    refreshTrigger={refreshTrigger}
                />
            )}

            {screen === "form" && (
                <ProductionScheduleOrderForm data={editData} onBack={handleBack} />
            )}
        </>
    );
};

export default ProductionScheduleOrder;