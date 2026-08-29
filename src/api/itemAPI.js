// src/api/itemAPI.js
import apiClient from "./apiClient";

export const itemAPI = {
  getItems: async (orgId, branch) => {
    try {
      const res = await apiClient.get(`/api/itemMaster/getItemMasterByOrgId?orgId=${orgId}&branchId=${branch}`);
      return res?.paramObjectsMap?.itemMasterVO || [];
    } catch (error) {
      console.error("Error fetching states:", error);
      throw error;
    }
  },

  getItemById: async (id) => {
    try {
      const res = await apiClient.get("/api/itemMaster/getItemMasterById", {
        params: { id },
      });
      return res?.paramObjectsMap?.itemMasterVO || null;
    } catch (error) {
      console.error("Error fetching item Item by ID:", error);
      throw error;
    }
  },

  createUpdateItem: async (itemDTO) => {
    try {
      const res = await apiClient.put("/api/itemMaster/updateCreateItemMaster", itemDTO);
      return res;
    } catch (error) {
      console.error("Error creating/updating item:", error);
      throw error;
    }
  },

  // Add this method to fetch suppliers
  getSuppliers: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/purchasedeliveryschedule/getSupplierDropdownForPurchaseContract?branch=${branch}&orgId=${orgId}`
      );

      console.log("Supplier API Response:", res);

      // Extract supplier list from response
      const suppliers = res?.paramObjectsMap?.supplierList || [];

      // Map to dropdown format
      return suppliers.map(supplier => ({
        value: supplier.supplierId,
        label: `${supplier.supplierCode} - ${supplier.supplierName}`,
        supplierId: supplier.supplierId,
        supplierCode: supplier.supplierCode,
        supplierName: supplier.supplierName
      }));
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  },
};

export default itemAPI;