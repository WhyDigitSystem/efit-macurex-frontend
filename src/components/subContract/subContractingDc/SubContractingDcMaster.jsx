import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubContractingDcList from "./SubContractingDcList";
import SubContractingDcForm from "./SubContractingDcForm";
import subContractingDCAPI from "../../../api/SubContract/subContractingDCAPI";
import { toast } from "../../../utils/toast";

const SubContractingDcMaster = () => {
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

  // Pencil icon click -> fetch fresh data by ID using getDeliveryChallanSubcontractingById
  const handleEdit = useCallback(
    async (row) => {
      try {
        // Fetch the full record by ID
        const response = await subContractingDCAPI.getDeliveryChallanSubcontractingById(row.id);
        console.log("Get By ID Response:", response);

        // Extract data from response
        let fresh = null;
        if (response?.paramObjectsMap?.deliveryChallanSubcontracting) {
          fresh = response.paramObjectsMap.deliveryChallanSubcontracting;
        } else if (response?.data?.paramObjectsMap?.deliveryChallanSubcontracting) {
          fresh = response.data.paramObjectsMap.deliveryChallanSubcontracting;
        } else if (response?.deliveryChallanSubcontracting) {
          fresh = response.deliveryChallanSubcontracting;
        } else {
          fresh = row;
        }

        // Transform the data to match the form's expected structure
        const transformedData = transformApiDataToForm(fresh);
        setEditData(transformedData);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch sub contracting DC for edit:", error);
        toast.error("Failed to load sub contracting DC details");
        // Fallback to using the row data from the list
        setEditData(row);
        setView("form");
      }
    },
    []
  );

  // Transform API response data to form structure
  const transformApiDataToForm = (data) => {
    if (!data) return null;

    return {
      id: data.id,
      plantId: data.branch?.id || data.branch || "",
      scDcNo: data.docId || data.scDcNo || "",
      scDcDate: data.docDate || data.scDcDate || "",
      belongsTo: data.belongsTo || "",
      department: data.department?.id || data.department || "",
      vendorId: data.vendor?.customerId || data.vendor || "",
      vendorName: data.vendor?.customerName || "",
      vendorAddress: data.vendor?.address || "",
      vendorGstNo: data.vendor?.gstNo || "",
      vendorGstState: data.vendor?.gstState || "",
      vendorGstType: data.vendor?.gstType || "",
      vendorCode: data.vendor?.customerCode || "",
      jobOrderNo: data.jobOrderNo || "",
      jobOrderDate: "", // Not available in this API
      partyLocation: data.partyLocation?.id || data.partyLocation || "",
      incomingPartNo: data.incomingItem?.id || data.incomingItem || "",
      partName: data.incomingItem?.itemDescription || "",
      qty: data.qty || "",
      transportName: data.transportName?.id || data.transportName || "",
      vehicleNo: data.vehicleNo || "",
      city: data.city || "",
      sfgBomId: data.sfgBomId?.id || data.sfgBomId || "",
      timeOfIssue: data.timeOfIssue || "",
      dcType: data.dcType || "",
      approvalByStores: data.approvalByStores || "",
      preparedBy: data.preparedBy?.id || data.preparedBy || "",
      approvedBy: data.approvedBy?.id || data.approvedBy || "",
      remarks: data.remarks || "",
      active: data.active !== "Inactive",
      // Map details for the outgoing items table
      outGoingItems: data.details?.map((detail) => ({
        id: detail.id,
        jobOrderFor: detail.jobOrderFor || "",
        contractNo: detail.contractNo || "",
        outgoingItemCode: detail.outgoingItem?.id || detail.outgoingItem || "",
        outgoingItemDescription: detail.outgoingItem?.itemDescription || "",
        stock: detail.stock || "",
        unit: detail.unit?.id || detail.unit || "",
        fromLocation: detail.fromLocation?.id || detail.fromLocation || "",
        availableStock: detail.availableStock || "",
        issueQty: detail.issueQty || "",
        unitRate: detail.unitRate || "",
        amount: detail.amount || "",
        remarks: detail.remarks || "",
      })) || [],
      summary: {
        summaryNotes: "",
        approvalStatus: "",
        additionalComments: "",
      },
    };
  };

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Sub Contract module home.
  // (Form's back button goes back to the list via handleBack.)
  const handleNavigateHome = () => {
    navigate("/subcontract");
  };

  if (view === "form") {
    return <SubContractingDcForm data={editData} onBack={handleBack} />;
  }

  return (
    <SubContractingDcList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SubContractingDcMaster;