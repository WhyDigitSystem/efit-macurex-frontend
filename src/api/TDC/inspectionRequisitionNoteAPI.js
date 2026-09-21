// inspectionRequisitionNoteAPI.js
import apiClient from "../apiClient";

/* Inspection Requisition Note API
   Endpoints confirmed against the live swagger (not /api/dev/* as before):

   - GET  /api/subContract/getInspectionRequisitionNoteByOrgIdAndBranch   (branch, orgId)
   - GET  /api/subContract/getInspectionRequisitionNoteById               (id)
   - PUT  /api/subContract/createUpdateInspectionRequisitionNote          (body: inspectionRequisitionNoteDTO)
   - GET  /api/commonmaster/getListValuesGroup?listDescription=REQUESTED BY&orgId=
   - GET  /api/commonmaster/getListValuesGroup?listDescription=PRODUCT CATEGORY&orgId=
   - GET  /api/subContract/getEmployeesByDepartmentforBOMCorrectionRequestNote?branch=&department=&orgId=

   The inspectionRequisitionNoteDTO is FLAT - there is no irnNo field and no
   nested managerPurchase/managerTdc/... objects. It uses:
   active, approvalRequestedBy, approvedBy, branch, cancelRemarks, createdBy,
   customer, date, docDate, financialYear, id, orgId, partName, partNumber,
   product, productCategory, productionManager, productionManagerDate,
   purchaseManager, purchaseManagerDate, qualityManager, qualityManagerDate,
   reasonForInspectionRequest, requestComments, requestedBy, sampleQuantity,
   samplesSubmittedTo, supplier, tdcManager, tdcManagerDate
*/
const inspectionRequisitionNoteAPI = {
  // Get Inspection Requisition Notes by Organization ID + Branch
  getIrnByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getInspectionRequisitionNoteByOrgIdAndBranch?branch=${branch}&orgId=${orgId}`,
      );
      // Exact response key for this list endpoint wasn't shown in the swagger
      // example (generic paramObjectsMap schema) - try the most likely key
      // names before falling back to an empty list.
      return (
        res?.paramObjectsMap?.inspectionRequisitionNoteVO ||
        res?.paramObjectsMap?.inspectionRequisitionNoteList ||
        res?.paramObjectsMap?.inspectionRequisitionNoteEntryVO ||
        []
      );
    } catch (error) {
      console.error("Error fetching inspection requisition notes:", error);
      throw error;
    }
  },

  // Get a single Inspection Requisition Note by id (used for edit)
  getIrnById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getInspectionRequisitionNoteById?id=${id}`,
      );
      return (
        res?.paramObjectsMap?.inspectionRequisitionNoteVO ||
        res?.paramObjectsMap ||
        null
      );
    } catch (error) {
      console.error("Error fetching inspection requisition note by id:", error);
      throw error;
    }
  },

  // Create / Update Inspection Requisition Note
  createUpdateIrn: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/subContract/createUpdateInspectionRequisitionNote",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving inspection requisition note:", error);
      throw error;
    }
  },

  // Header "Requested By" dropdown values (e.g. PURCHASE, TDC)
  getRequestedByList: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getListValuesGroup?listDescription=REQUESTED BY&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error("Error fetching Requested By list:", error);
      throw error;
    }
  },

  // Header "Product Category" dropdown values (e.g. APPLAINCES, AUTOMOTIVE)
  getProductCategoryList: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getListValuesGroup?listDescription=PRODUCT CATEGORY&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.listValues || [];
    } catch (error) {
      console.error("Error fetching Product Category list:", error);
      throw error;
    }
  },

  // Employees filtered by department - used for the 4 manager "Sign" dropdowns.
  // department is one of: "Purchase" | "TDC" | "Quality" | "Production"
  getEmployeesByDepartment: async (branch, department, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getEmployeesByDepartmentforBOMCorrectionRequestNote?branch=${branch}&department=${department}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.employeeList || [];
    } catch (error) {
      console.error(`Error fetching ${department} employees:`, error);
      throw error;
    }
  },
};

export default inspectionRequisitionNoteAPI;
