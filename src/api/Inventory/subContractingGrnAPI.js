import apiClient from "../apiClient";

const subContractingGrnAPI = {
  getGrnByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getSubContractingGRNByOrgIdAndBranch",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.subContractingGRN || [];
    } catch (error) {
      console.error("Error fetching sub contracting GRNs:", error);
      throw error;
    }
  },

  getGrnById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getSubContractingGRNById",
        { params: { id } },
      );
      const rec = res?.paramObjectsMap?.subContractingGRN;
      return Array.isArray(rec) ? rec[0] || null : rec || null;
    } catch (error) {
      console.error("Error fetching sub contracting GRN by id:", error);
      throw error;
    }
  },

  createUpdateGrn: async (payload, files = []) => {
    try {
      const formData = new FormData();

      const grnBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });

      formData.append(
        "subContractingGRNDTO",
        grnBlob,
        "subContractingGRNDTO.json",
      );

      files.forEach((file) => {
        if (file) {
          formData.append("files", file, file.name);
        }
      });

      const res = await apiClient.put(
        "/api/subContract/createUpdateSubContractingGRN",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return res;
    } catch (error) {
      console.error("Error saving sub contracting GRN:", error);
      throw error;
    }
  },

  getGrnDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getSubContractingGRNDocId",
        { params: { financialYear, orgId } },
      );
      return res?.paramObjectsMap?.subContractingGRNDocId || "";
    } catch (error) {
      console.error("Error fetching sub contracting GRN doc id:", error);
      throw error;
    }
  },

  getCustomerForSupplierRateContract: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getCustomerForSupplierRateContract",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.customerList || [];
    } catch (error) {
      console.error("Error fetching supplier rate contract customers:", error);
      throw error;
    }
  },

  getGateInwardEntry: async (branch, customer, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getGateInwardEntryforSubContractingGRN",
        { params: { branch, customer, orgId } },
      );
      return res?.paramObjectsMap?.GateInwardEntryVO || [];
    } catch (error) {
      console.error("Error fetching gate inward entries:", error);
      throw error;
    }
  },

  getSubcontractSupplySchedule: async (branch, customer, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getSubcontractSupplyScheduleforSubContractingGRN",
        { params: { branch, customer, orgId } },
      );
      return res?.paramObjectsMap?.SubcontractSupplyScheduleVO || [];
    } catch (error) {
      console.error("Error fetching subcontract supply schedule:", error);
      throw error;
    }
  },

  getItemDetailsForGrn: async (branch, customer, orgId, scheduleNo) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getItemDetailsForSubContractingGRN",
        { params: { branch, customer, orgId, scheduleNo } },
      );
      return res?.paramObjectsMap?.SubcontractSupplyScheduleItemVO || [];
    } catch (error) {
      console.error("Error fetching item details for GRN:", error);
      throw error;
    }
  },

  getBomItemDetails: async (branch, itemId, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getBomItemDetailsforSubContractingGRN",
        { params: { branch, itemId, orgId } },
      );
      return res?.paramObjectsMap?.BomItemDetailsVO || [];
    } catch (error) {
      console.error("Error fetching BOM item details:", error);
      throw error;
    }
  },

  getViewFileUrl: (filePath) => {
    if (!filePath) return "";
    return filePath;
  },
};

export default subContractingGrnAPI;
export { subContractingGrnAPI };
