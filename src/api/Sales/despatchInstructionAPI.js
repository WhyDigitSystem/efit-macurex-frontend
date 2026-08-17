import apiClient from "../apiClient";

/* Despatch Instruction API */
const despatchInstructionAPI = {
  // Get Despatch Instructions by Organization ID
  getDispatchByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getDespatchIntructionByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.despatchInstructionResponseDTO || [];
    } catch (error) {
      console.error("Error fetching despatch instructions:", error);
      throw error;
    }
  },

  // Get Despatch Instruction By ID
  getDispatchById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getDespatchIntructionById?id=${id}`,
      );
      return res?.paramObjectsMap?.despatchInstructionResponseDTO || null;
    } catch (error) {
      console.error("Error fetching despatch instruction by ID:", error);
      throw error;
    }
  },

  // Get Schedule Number Dropdown
  getScheduleNoDropdownForDespatchInstruction: async (branch, customerId, monthYear, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getScheduleNoDropdownForDespatchInstruction?branch=${branch}&customer=${customerId}&monthYear=${monthYear}&orgId=${orgId}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching schedule options:", error);
      throw error;
    }
  },

  // Get Order and Sales Contract Dropdown
  getOrderAndSalesContractDropdown: async (branch, customerId, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getOrderAndSalesContractDropdownFromDespatchInstruction?branch=${branch}&customerId=${customerId}&orgId=${orgId}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching order contracts:", error);
      throw error;
    }
  },

  // Get Fill Grid Items
  getFillGridItems: async (branch, customerId, orgId, sdvBasicId) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getFillGridItemsForDespatchInstruction?branch=${branch}&customerId=${customerId}&orgId=${orgId}&sdvBasicId=${sdvBasicId}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching fill grid items:", error);
      throw error;
    }
  },

  // Get Schedule Month
  getScheduleMonth: async (branch, scheduleNo, itemId, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getScheduleMonthForDespatchInstruction?branch=${branch}&dlvno=${scheduleNo}&item=${itemId}&orgId=${orgId}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching schedule months:", error);
      throw error;
    }
  },

  // Get Planned Quantity
  getPlannedQty: async (branch, itemId, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getPlannedQtyForDespatchInstruction?branch=${branch}&item=${itemId}&orgId=${orgId}`,
      );
      return res;
    } catch (error) {
      console.error("Error fetching planned quantity:", error);
      throw error;
    }
  },

  // Create / Update Despatch Instruction
  createUpdateDispatch: async (payload) => {
    try {
      const res = await apiClient.post(
        "/api/dev/updateCreateDespatchIntruction",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving despatch instruction:", error);
      throw error;
    }
  },
};

export default despatchInstructionAPI;