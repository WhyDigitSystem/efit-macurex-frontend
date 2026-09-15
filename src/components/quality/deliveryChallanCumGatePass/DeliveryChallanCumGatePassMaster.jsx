import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeliveryChallanCumGatePassList from "./DeliveryChallanCumGatePassList";
import DeliveryChallanCumGatePassForm from "./DeliveryChallanCumGatePassForm";
import deliveryChallanCumGatePassAPI from "../../../api/quality/deliveryChallanCumGatePassAPI";
import { toast } from "../../../utils/toast";

const DeliveryChallanCumGatePassMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Transform GetById response to match Form expected structure
  const transformForForm = (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      docNo: apiData.docId,
      docDate: apiData.docDate,
      plantId: apiData.branch?.id,
      belongsTo: apiData.belongsTo,
      type: apiData.type,
      department: apiData.department?.id,
      partyPlantId: apiData.customer?.customerId ?? apiData.toBranch?.id,
      partyPlantName: apiData.customer?.customerName ?? apiData.toBranch?.branchName,
      refNo: apiData.refNo,
      refDate: apiData.refDate,
      fromLocation: apiData.fromLocation?.id,
      modeOfTransport: apiData.modeOfTransport,
      vehicleNo: apiData.vehicleNo,
      workOrderNo: apiData.workOrderNo,
      gstinNo: apiData.gstnNo,
      isIgstApplicable: apiData.igstappl === true ? "Yes" : "No",
      preparedBy: apiData.preparedBy?.id,
      remarks: apiData.remarks,
      active: apiData.active === "Active",
      gatePassDetails: apiData.deliveryChallanCumGatePassDetails?.map((d) => ({
        itemCode: d.item?.itemCode,
        itemDescription: d.item?.itemDescription,
        hsnSacCode: d.hsnSacCode?.hsn,
        unit: d.unit?.id,
        stock: d.stock,
        availableQty: d.availableQty,
        qty: d.qty,
        dueDate: d.dueDate,
        previousQty: d.previousQty,
        lcRate: d.lcRate,
        rate: d.rate,
        amount: d.amount,
      })) || [],
      gatePassSummary: {
        totalQty: apiData.totalQty,
        summaryNotes: apiData.summaryNotes,
      },
    };
  };

  // Pencil icon click -> fetch fresh data by ID using GetById API, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const fresh = await deliveryChallanCumGatePassAPI.getDcgpById(row.id);
        setEditData(transformForForm(fresh));
        setView("form");
      } catch (error) {
        console.error("Failed to fetch DCGP for edit:", error);
        toast.error("Failed to load Delivery Challan Cum Gate Pass details");
      }
    },
    [],
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Quality module home.
  const handleNavigateHome = () => {
    navigate("/quality");
  };

  if (view === "form") {
    return (
      <DeliveryChallanCumGatePassForm data={editData} onBack={handleBack} />
    );
  }

  return (
    <DeliveryChallanCumGatePassList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default DeliveryChallanCumGatePassMaster;
