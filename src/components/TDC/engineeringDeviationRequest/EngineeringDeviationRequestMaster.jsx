import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import EngineeringDeviationRequestList from "./EngineeringDeviationRequestList";
import EngineeringDeviationRequestForm from "./EngineeringDeviationRequestForm";
import engineeringDeviationRequestAPI from "../../../api/TDC/engineeringDeviationRequestAPI";
import { toast } from "../../../utils/toast";

const EngineeringDeviationRequestMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch fresh data by ID, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const response = await engineeringDeviationRequestAPI.getEngineeringDeviationById(
          row.id,
        );

        // Extract the data from the response
        let freshData = response?.paramObjectsMap?.engineeringDeviationRequestVO ||
          response?.paramObjectsMap?.engineeringDeviationRequest ||
          response;

        if (!freshData) {
          toast.error("Failed to load Engineering Deviation Request details");
          return;
        }

        // If the response is an array, get the first item
        if (Array.isArray(freshData) && freshData.length > 0) {
          freshData = freshData[0];
        }

        // Map the data to match the form's expected structure
        const mappedData = {
          id: freshData.id,
          date: freshData.docDate || "",
          requestNo: freshData.docId || "",
          to: freshData.toDepartment?.id || "",
          deviationRequestedBy: freshData.requestedBy?.employeeId || "",
          partDescription: freshData.partDescription || "",
          customerId: freshData.customerId || "",
          productName: freshData.productName || "",
          quantityReceived: freshData.quantityReceived || "",
          supplier: freshData.supplier || "",
          deviationApprovedBy: freshData.deviationRequistApprovedBy?.employeeId || "",
          partNoDrawingNo: freshData.partNo || "",
          invoiceNo: freshData.invoiceNo || "",
          active: freshData.active !== false,
          // Request of Deviation
          requestOfDeviation: {
            descriptionOfNc: freshData.descriptionOfTheNC || "",
            reasonForDeviationRequest: freshData.reasonForDeviationRequest || "",
            actionOnNc: freshData.actionOnNC || "",
            deviationPeriodFrom: freshData.deviationPeriod?.split(" to ")[0] || "",
            deviationPeriodTo: freshData.deviationPeriod?.split(" to ")[1] || "",
            responsibleForName: freshData.responsibleForName?.employeeId || "",
            department: freshData.department?.id || "",
          },
          // Review of Deviation
          reviewOfDeviation: {
            affectFit: freshData.willTheNCAffectTheFit || "",
            affectForm: freshData.willTheNCAffectTheForm || "",
            affectFunction: freshData.willTheNCAffectTheFunction || "",
            affectSafety: freshData.willTheNCAffectTheSafety || "",
            natureOfDeviationRequest: freshData.natureOfTheDeviationRequest || "",
            intimatedToCustomer: freshData.toBeIntimatedToCustomerAndActionOnCustomerFeedBack || "",
            note: freshData.note || "",
          },
          // Approvals
          approvals: {
            productionManager: freshData.productionMgr?.employeeId || "",
            productionDisposition: freshData.productionMgrDisposition || "",
            qualityManager: freshData.qualityMgr?.employeeId || "",
            qualityDisposition: freshData.qualityMgrDisposition || "",
            tdcManager: freshData.tdcmgr?.employeeId || "",
            tdcDisposition: freshData.tdcMgrDisposition || "",
            directorTechnical: freshData.directorTechnical?.employeeId || "",
            directorTechnicalDisposition: freshData.directorTechnicalDisposition || "",
            purchaseManager: freshData.purMgr?.employeeId || "",
            purchaseDisposition: freshData.purMgrDisposition || "",
          },
          // Customer Intimation
          customerIntimation: {
            intimationModeRef: freshData.customerIntimationModeAndReference || "",
            customerFeedback: freshData.customerFeedBack || "",
            feedbackModeRef: freshData.customerFeedBackModeAndReference || "",
            decision: freshData.decision || "",
          },
          // PDF Attachments
          pdfAttachments: (freshData.engineeringDeviationAttachmentDTO || []).map((attachment) => ({
            referenceAttachFile: attachment.fileName || attachment.name || null,
          })),
        };

        setEditData(mappedData);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch EDR for edit:", error);
        toast.error("Failed to load Engineering Deviation Request details");
      }
    },
    []
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the TDC module home.
  const handleNavigateHome = () => {
    navigate("/TDC");
  };

  if (view === "form") {
    return <EngineeringDeviationRequestForm data={editData} onBack={handleBack} />;
  }

  return (
    <EngineeringDeviationRequestList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default EngineeringDeviationRequestMaster;