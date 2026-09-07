import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import SupplierRateContractAmendmentList from "./SupplierRateContractAmendmentList";
import SupplierRateContractAmendmentForm from "./SupplierRateContractAmendmentForm";
import { toast } from "../../../utils/toast";
import supplierRateContractAmendmentAPI from "../../../api/SubContract/supplierRateContractAmendmentAPI";

const SupplierRateContractAmendmentMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  const handleEdit = useCallback(
    async (row) => {
      try {
        const response = await supplierRateContractAmendmentAPI.getSupplierRateContractAmendmentById(
          row.id,
        );

        const freshData = response?.paramObjectsMap?.supplierRateContractAmendment ||
          response?.data?.paramObjectsMap?.supplierRateContractAmendment ||
          response;

        if (!freshData) {
          toast.error("Failed to load supplier rate contract amendment details");
          return;
        }

        const mappedData = {
          id: freshData.id,
          plantId: freshData.branch?.id || "",
          belongsTo: freshData.belongsTo || "",
          department: "",
          partyId: freshData.customer?.customerId || "",
          partyName: freshData.customer?.customerName || "",
          contractNo: freshData.contractNo || "",
          contractDate: freshData.contractDate || "",
          validFrom: freshData.validFrom || "",
          validTo: freshData.validTo || "",
          newValidFrom: freshData.newValidFrom || "",
          newValidTo: freshData.newValidTo || "",
          amendmentNo: freshData.docId || "",
          amendmentDate: freshData.docDate || "",
          revisionNo: Number(freshData.revisionNo) || 1,
          active: freshData.active === "Active",
          details: {
            freightType: freshData.freightType || "",
            packingType: freshData.packingType || "",
            insuranceAmount: freshData.insuranceAmount || "",
            modeOfDespatch: freshData.modeOfDespatch || "",
            taxDescription: freshData.taxDescription || "",
            preparedBy: freshData.preparedBy?.id || "",
            authorizedBy: freshData.authorisedBy?.id || "",
            remarks: freshData.remarks || "",
          },
          supplierRateDetails: (freshData.itemDetails || []).map((item) => ({
            itemCode: item.itemCode?.id || "",
            itemDescription: item.itemCode?.itemDescription || "",
            unit: item.unit?.id || "",
            unitLabel: item.unit?.unitId || "",
            oldRate: item.oldRate || "",
            newRate: item.newRate || "",
          })),
          summary: {
            summaryNotes: "",
            approvalStatus: "",
            additionalComments: "",
          },
        };

        setEditData(mappedData);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch supplier rate contract amendment for edit:", error);
        toast.error("Failed to load supplier rate contract amendment details");
      }
    },
    []
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNavigateHome = () => {
    navigate("/subcontract");
  };

  if (view === "form") {
    return (
      <SupplierRateContractAmendmentForm data={editData} onBack={handleBack} />
    );
  }

  return (
    <SupplierRateContractAmendmentList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SupplierRateContractAmendmentMaster;