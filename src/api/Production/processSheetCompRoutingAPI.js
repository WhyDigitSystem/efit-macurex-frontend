import apiClient from "../apiClient";

/* Process Sheet / Component Routing Master API
   Follows the commonmaster API convention used across this app.
   The backend persists the routing header + routing details + charges
   summary + tool/fixture details + machine details records in a single
   transaction, links the record to the plant, FG/SFG item, BOM and cost
   rate details and keeps the complete routing history with charges, tools
   and machine usage for audit purposes (server-side validation).
   NOTE: endpoint paths are speculative - confirm against the backend
   swagger before going live. */
const toList = (res, field) =>
  res?.paramObjectsMap?.[field] ||
  res?.data?.paramObjectsMap?.[field] ||
  (Array.isArray(res) ? res : []);

const processSheetCompRoutingAPI = {
  getByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getProcessSheetCompRoutingByOrgId?orgId=${orgId}&branch=${branch}`,
      );
      return (
        res?.paramObjectsMap?.processSheetCompRoutingList ||
        res?.paramObjectsMap?.processSheetVOList ||
        []
      );
    } catch (error) {
      console.error("Error fetching process sheet / routing records:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getProcessSheetCompRoutingById?id=${id}`,
      );
      return res?.paramObjectsMap?.processSheetCompRoutingVO || null;
    } catch (error) {
      console.error("Error fetching process sheet / routing by id:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.put(
        "/api/commonmaster/updateCreateProcessSheetCompRouting",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving process sheet / routing master:", error);
      throw error;
    }
  },

  // ---------------- Lookups ----------------

  getLocations: async (orgId, branch) => {
    try {
      const res = await apiClient.get("/api/commonmaster/getLocationByOrgId", {
        params: { orgId, branch },
      });
      return toList(res, "transportList");
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  },

  getOperations: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/operation/getOperations?orgId=${orgId}&branchId=${branch}`,
      );
      return toList(res, "operationList");
    } catch (error) {
      console.error("Error fetching operations:", error);
      throw error;
    }
  },

  getMachines: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/machine/getMachines?orgId=${orgId}&branchId=${branch}`,
      );
      return toList(res, "machineList");
    } catch (error) {
      console.error("Error fetching machines:", error);
      throw error;
    }
  },
};

export default processSheetCompRoutingAPI;