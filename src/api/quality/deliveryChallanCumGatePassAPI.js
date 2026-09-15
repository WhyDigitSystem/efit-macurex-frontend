// deliveryChallanCumGatePassAPI.js
import apiClient from "../apiClient";

const deliveryChallanCumGatePassAPI = {
  // Get Delivery Challan Cum Gate Passes by Organization ID
  getDcgpByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getDeliveryChallanCumGatePassByOrgIdAndBranch?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.deliveryChallanCumGatePass || [];
    } catch (error) {
      console.error("Error fetching delivery challan cum gate passes:", error);
      throw error;
    }
  },

  // Get Delivery Challan Cum Gate Pass by ID
  getDcgpById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getDeliveryChallanCumGatePassById?id=${id}`,
      );
      return res?.paramObjectsMap?.deliveryChallanCumGatePass || null;
    } catch (error) {
      console.error("Error fetching delivery challan cum gate pass by ID:", error);
      throw error;
    }
  },

  // Create / Update Delivery Challan Cum Gate Pass
  createUpdateDcgp: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/subContract/createUpdateDeliveryChallanCumGatePass",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving delivery challan cum gate pass:", error);
      throw error;
    }
  },

  // Get Work Order No filtered by the selected Party/Plant
  getJobOrderNo: async (branch, customer, orgId) => {
    try {
      console.log("[DCGP] getJobOrderNo params:", { branch, customer, orgId });
      const res = await apiClient.get(
        `/api/subContract/getJobOrderNoAndDateForJobOrderAmd?branch=${branch}&customer=${customer}&orgId=${orgId}`,
      );
      console.log("[DCGP] getJobOrderNo raw response:", res);
      if (res?.paramObjectsMap?.jobOrderList) {
        console.log(
          "[DCGP] jobOrderList length:",
          res.paramObjectsMap.jobOrderList.length,
        );
      } else {
        console.warn(
          "[DCGP] NO paramObjectsMap.jobOrderList in response. Keys:",
          Object.keys(res || {}),
        );
      }
      return res?.paramObjectsMap?.jobOrderList || [];
    } catch (error) {
      console.error("Error fetching work order no for dcgp:", error);
      throw error;
    }
  },

  // Get Delivery Challan Cum Gate Pass Details rows filtered by the Work Order No
  getDcgpDetailsRows: async (branch, customer, jobOrderNo, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getDeliveryChallanCumGatePassDetails?branch=${branch}&customer=${customer}&jobOrderNo=${encodeURIComponent(
          jobOrderNo,
        )}&orgId=${orgId}`,
      );
      console.log("[DCGP] getDcgpDetailsRows raw response:", res);
      const rows =
        res?.paramObjectsMap?.deliveryChallanCumGatePassDetails ||
        res?.paramObjectsMap?.deliveryChallanCumGatePassEntryVO ||
        [];
      console.log("[DCGP] getDcgpDetailsRows rows count:", rows.length);
      return rows;
    } catch (error) {
      console.error("Error fetching dcgp detail rows:", error);
      throw error;
    }
  },

  // Get Item Details for Sales Return used as the grid Item Code options
  getItemDetailsForSalesReturn: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/transaction/getItemDetailsForSalesReturn?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.itemDetails || [];
    } catch (error) {
      console.error("Error fetching item details for sales return:", error);
      throw error;
    }
  },



  // Auto-generate Delivery Challan Cum Gate Pass Doc No from the backend
  getDeliveryChallanCumGatePassDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getDeliveryChallanCumGatePassDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return (
        res?.paramObjectsMap?.deliveryChallanCumGatePassDocId ||
        ""
      );
    } catch (error) {
      console.error("Failed to generate DCGP Doc No:", error);
      throw error;
    }
  },
};

export default deliveryChallanCumGatePassAPI;
