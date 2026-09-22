import { useCallback, useState } from "react";
import ReconcileConsumptionStockList from "./reconcileConsumptionStockList";
import ReconcileConsumptionStockForm from "./reconcileConsumptionStockForm";
import reconcileConsumptionStockAPI from "../../../api/Production/reconcileConsumptionStockAPI";
import { toast } from "../../../utils/toast";

/* ------------------------------------------------------------------ */
/* Map the flat backend response into the form's expected shape       */

const mapApiToFormData = (src) => {
    if (!src) return null;

    return {
        id: src.id,
        active: src.active !== false,
        createdBy: src.createdBy,
        updatedBy: src.updatedBy,

        plantId: src.branch?.id ?? "",
        docId: src.docId ?? "",
        docDate: src.docDate ?? "",
        reconcileDate: src.reconcileDate ?? "",
        shopFloor: src.shopFloor?.id ?? "",
        fgItem: src.fgItem?.id ?? "",
        rmLocation: src.rmLocation?.id ?? "",

        items: (src.details || []).map((d) => ({
            itemId: d.item?.id ?? "",
            itemDescription: d.item?.itemDescription ?? "",
            unit: d.unit?.unitId ?? "",
            unitId: d.unit?.id ?? "",
            availableQty: d.availableQty ?? 0,
            consumptionQty: d.consumptionQty ?? 0,
            postedQty: d.postedQty ?? 0,
            differenceQty: d.differenceQty ?? 0,
            rate: d.rate ?? 0,
            value: d.value ?? 0,
        })),
    };
};

/* ------------------------------------------------------------------ */

const ReconcileConsumptionStock = ({ onBack }) => {
    const [screen, setScreen] = useState("list");
    const [editData, setEditData] = useState(null);
    const [editId, setEditId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAddNew = () => {
        setEditData(null);
        setEditId(null);
        setScreen("form");
    };

    const handleEdit = useCallback(async (row) => {
        if (!row?.id) {
            toast.error("Invalid record");
            return;
        }

        try {
            const fresh = await reconcileConsumptionStockAPI.getById(row.id);
            setEditId(row.id);
            setEditData(mapApiToFormData(fresh));
            setScreen("form");
        } catch (error) {
            console.error("Failed to fetch reconcile record:", error);
            toast.error("Failed to load Reconcile Consumption Stock");
        }
    }, []);

    const handleBack = () => {
        setScreen("list");
        setEditData(null);
        setEditId(null);
        setRefreshTrigger((prev) => prev + 1);
    };

    return (
        <>
            {screen === "list" && (
                <ReconcileConsumptionStockList
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    onBack={onBack || (() => window.history.back())}
                    refreshTrigger={refreshTrigger}
                />
            )}

            {screen === "form" && (
                <ReconcileConsumptionStockForm
                    editId={editId}
                    editData={editData}
                    onBack={handleBack}
                    onSave={handleBack}
                />
            )}
        </>
    );
};

export default ReconcileConsumptionStock;