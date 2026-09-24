import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScheduleOrderShortCloseList from "./ScheduleOrderShortCloseList";
import ScheduleOrderShortCloseForm from "./ScheduleOrderShortCloseForm";
import productionScheduleOrderShortCloseAPI from "../../../api/Production/productionScheduleOrderShortCloseAPI";
import { toast } from "../../../utils/toast";

/* ------------------------------------------------------------------ */
/* Map the flat backend response into the form's expected shape       */

const fmtDate = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const mapApiToFormData = (src) => {
  if (!src) return null;

  return {
    id: src.id,
    active: src.active === true || src.active === "Active",

    plantId: src.branch?.id ?? "",
    docId: src.docId ?? "",
    date: src.docDate ?? "",
    item: src.item
      ? {
        id: src.item.id ?? "",
        itemCode: src.item.itemCode ?? "",
        itemDescription: src.item.itemDescription ?? "",
      }
      : null,
    unit: src.unit
      ? {
        id: src.unit.id ?? "",
        unitId: src.unit.unitId ?? "",
      }
      : null,

    narration: src.narration ?? "",

    productionOrderDetails: (src.productionOrderDetails || []).map((d) => ({
      id: d.id ?? "",
      scheduleOrderNo: d.scheduleOrderNo ?? "",
      scheduleDate: fmtDate(d.scheduleDate),
      scheduleOrderQty: d.scheduleOrderQty ?? "",
      balanceQty: d.balanceQty ?? "",
      newReqQty: d.newReqQty ?? "",
      shortClosedQty: d.shortClosedQty ?? "",
      reason: d.reason ?? "",
    })),
  };
};

/* ------------------------------------------------------------------ */

const ScheduleOrderShortCloseMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  const handleEdit = useCallback(async (row) => {
    if (!row?.id) {
      toast.error("Invalid record");
      return;
    }

    try {
      const fresh =
        await productionScheduleOrderShortCloseAPI.getById(row.id);
      setEditData(mapApiToFormData(fresh));
      setView("form");
    } catch (error) {
      console.error("Failed to fetch Short Close for edit:", error);
      toast.error("Failed to load Short Close details");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNavigateHome = () => {
    navigate("/production");
  };

  if (view === "form") {
    return (
      <ScheduleOrderShortCloseForm data={editData} onBack={handleBack} />
    );
  }

  return (
    <ScheduleOrderShortCloseList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default ScheduleOrderShortCloseMaster;