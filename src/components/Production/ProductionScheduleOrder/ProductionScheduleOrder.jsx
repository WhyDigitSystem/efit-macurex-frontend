import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductionScheduleOrderForm from "./ProductionScheduleOrderForm";
import ProductionScheduleOrderList from "./ProductionScheduleOrderList";
import productionScheduleOrderAPI from "../../../api/Production/productionScheduleOrderAPI";
import dayjs from "dayjs";

/* ------------------------------------------------------------------ */
/* Map the flat backend response into the form's expected shape       */

const fmtDateDMY = (value) => {
    if (!value) return "";
    const d = dayjs(value);
    return d.isValid() ? d.format("DD-MM-YYYY") : "";
};

const mapApiToFormData = (src) => {
    if (!src) return null;

    return {
        id: src.id,
        active: src.active === true || src.active === "Active",

        plantId: src.branch?.id ?? "",
        scheduleOrderNo: src.docId ?? "",
        scheduleOrderType: src.orderType ?? "",
        date: fmtDateDMY(src.docDate),                      // ← date
        lcPoNo: src.lcPoNo ?? "",
        lcPoDate: fmtDateDMY(src.lcPoDate),                 // ← date
        fgItemCode: src.fgItem?.id ?? "",
        fgItemDescription: src.fgItem?.itemDescription ?? "",
        compRouteNo: src.compRouteNo?.id ?? "",
        bomId: src.bom?.id ?? "",
        scheduleStartDate: fmtDateDMY(src.scheduleStartDate),  // ← date
        scheduleEndDate: fmtDateDMY(src.scheduleEndDate),      // ← date
        batchQty: src.batchQty ?? "",
        shortClosed:
            src.shortClose === "Yes" ||
                src.shortClosed === "Yes" ||
                src.shortClosed === true
                ? "Yes"
                : "No",

        productionDetails: (
            src.productionScheduleOrderDetailsResponseDTO ||
            src.productionScheduleOrderDetailsDTO ||
            []
        ).map((d) => ({
            itemCode: d.item?.id ?? "",
            itemDescription: d.item?.itemDescription ?? "",
            itemType: d.itemType ?? "",
            bomQty: d.bomQty ?? "",
            qtyRequired: d.qtyRequired ?? "",
            unit: d.unit?.id ?? "",
            scrapQty: d.scrapQty ?? "",
            scrapUnit: d.scrapUnit?.id ?? "",
        })),

        schedules: (
            src.scheduleDetailsResponseDTO ||
            src.scheduleDetailsDTO ||
            []
        ).map((s) => ({
            scheduledDate: fmtDateDMY(s.scheduleDate),         // ← date
            qty: s.qty ?? "",
            remarks: s.remarks ?? "",
        })),
    };
};

/* ------------------------------------------------------------------ */

const ProductionScheduleOrder = () => {
    const navigate = useNavigate();
    const [screen, setScreen] = useState("list");
    const [editData, setEditData] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const addNew = () => {
        setEditData(null);
        setScreen("form");
    };

    const edit = useCallback(async (row) => {
        if (!row?.id) return;
        try {
            const fresh = await productionScheduleOrderAPI.getById(row.id);
            setEditData(mapApiToFormData(fresh));   // ← must pass the mapped object
            setScreen("form");
        } catch (error) {
            console.error("Failed to fetch production schedule order for edit:", error);
        }
    }, []);

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