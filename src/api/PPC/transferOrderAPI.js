import apiClient from "../apiClient";

const transferOrderAPI = {
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getTransferOrderByOrgId",
        { params: { orgId } }
      );
      return res?.paramObjectsMap?.transferOrderResponseVO || [];
    } catch (error) {
      console.error("Error fetching transfer orders:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getTransferOrderById",
        { params: { id } }
      );
      return res?.paramObjectsMap?.transferOrderResponseVO || null;
    } catch (error) {
      console.error("Error fetching transfer order by id:", error);
      throw error;
    }
  },

  getTransferOrderDocId: async (orgId, financialYear) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getTransferOrderDocId",
        { params: { orgId, financialYear } }
      );
      return res?.paramObjectsMap?.transferOrderDocId || "";
    } catch (error) {
      console.error("Error fetching transfer order doc id:", error);
      throw error;
    }
  },

  getTransferOrderItemDropdown: async (orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getTransferOrderItemDropdown",
        { params: { orgId } }
      );
      return res?.paramObjectsMap?.itemList || [];
    } catch (error) {
      console.error("Error fetching transfer order items:", error);
      throw error;
    }
  },

  // NEW
  getTypeDropdownByOrderType: async (orderType, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/develop/getTypeDropdownByOrderTypeForTransferOrder",
        { params: { orderType, orgId } }
      );
      return res?.paramObjectsMap?.typeList || [];
    } catch (error) {
      console.error("Error fetching type dropdown:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.put(
        "/api/develop/createUpdateTransferOrder",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return res;
    } catch (error) {
      console.error("Error saving transfer order:", error);
      throw error;
    }
  },
};

export default transferOrderAPI;