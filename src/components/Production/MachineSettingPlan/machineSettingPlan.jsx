import { useCallback, useState } from "react";
import machineSettingPlanAPI from "../../../api/Production/machineSettingPlanAPI";
import MachineSettingPlanForm from "./machineSettingPlanForm";
import MachineSettingPlanList from "./machineSettingPlanList";
import { toast } from "../../../utils/toast";

/* ------------------------------------------------------------------ */
/* Map the flat backend response into the form's expected shape       */

const empId = (obj) =>
    obj && typeof obj === "object" ? obj.employeeId ?? obj.id ?? "" : obj ?? "";

const mapApiToFormData = (src) => {
    if (!src) return null;

    return {
        id: src.id,
        active: src.active !== false,
        createdBy: src.createdBy,
        updatedBy: src.updatedBy,

        // header fields (form reads data.xxx)
        plantId: src.branch?.id ?? "",
        docNo: src.docId ?? "",
        date: src.docDate ?? "",
        itemCode: src.item?.id ?? "",
        itemDescription: src.item?.itemDescription ?? "",
        operationNo: src.operationNo ?? "",
        operationName: src.operationName ?? "",
        machineNo: src.machineNo ?? "",
        machineName: src.machineName ?? "",
        processSheetNo: src.processSheetNo ?? "",
        make: src.make ?? "",
        toolReplacementPlan: src.toolReplacementPlan ?? "",

        // detail rows
        msetDetails: (src.details || []).map((d) => ({
            parameter: d.parameter ?? "",
            value: d.value ?? "",
        })),

        // summary
        preparedBy: empId(src.preparedBy),
        approvedBy: empId(src.approvedBy),
    };
};

/* ------------------------------------------------------------------ */

const MachineSettingPlan = ({ onBack }) => {
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
            const fresh = await machineSettingPlanAPI.getById(row.id);
            setEditId(row.id);
            setEditData(mapApiToFormData(fresh));
            setScreen("form");
        } catch (error) {
            console.error("Failed to fetch machine setting plan:", error);
            toast.error("Failed to load Machine Setting Plan");
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
                <MachineSettingPlanList
                    onAddNew={handleAddNew}
                    onEdit={handleEdit}
                    onBack={onBack || (() => window.history.back())}
                    refreshTrigger={refreshTrigger}
                />
            )}

            {screen === "form" && (
                <MachineSettingPlanForm
                    editId={editId}
                    editData={editData}
                    onBack={handleBack}
                    onSave={handleBack}
                />
            )}
        </>
    );
};

export default MachineSettingPlan;