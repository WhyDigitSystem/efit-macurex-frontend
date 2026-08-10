// salesOrderShortCloseAPI.js
import apiClient from "../apiClient";

/* Sales Order Short-Close API
   Mirrors the transaction/dev API convention used in this app.
   The backend persists the header, short-close detail items and the
   short-close summary in a single transaction and keeps the complete
   short-close history for audit purposes (server-side validation). */
const salesOrderShortCloseAPI = {
  // Get Sales Order Short-Closes by Organization ID
  // Response: paramObjectsMap.salesOrderShortCloseResponseDTO = [...]
  getSalesOrderShortCloseByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/orderAcceptance/getSalesOrderShortCloseByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.salesOrderShortCloseResponseDTO || [];
    } catch (error) {
      console.error("Error fetching sales order short-closes:", error);
      throw error;
    }
  },

  // Get Sales Order Short-Close by ID
  // Response: paramObjectsMap.salesOrderShortCloseResponseVO = {...}
  getSalesOrderShortCloseById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/orderAcceptance/getSalesOrderShortCloseById?id=${id}`,
      );
      return res?.paramObjectsMap?.salesOrderShortCloseResponseVO || null;
    } catch (error) {
      console.error("Error fetching sales order short-close by ID:", error);
      throw error;
    }
  },

  // Get customers for the Customer ID dropdown.
  // Response: paramObjectsMap.customerDetails = [{ customerId, customerName, customerCode }]
  getCustomerDetails: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/transaction/getCustomerDetails?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.customerDetails || [];
    } catch (error) {
      console.error("Error fetching customer details:", error);
      throw error;
    }
  },

  // Get Order Acceptance doc ids (Sales Agreement No dropdown) for a customer.
  // Response: paramObjectsMap.items = [{ orderAccptanceId, docId, docDate }]
  getOrderAcceptanceDocIdDetails: async (customer) => {
    try {
      const res = await apiClient.get(
        `/api/orderAcceptance/getOrderAcceptanceDocIdDetails?customer=${customer}`,
      );
      return res?.paramObjectsMap?.items || [];
    } catch (error) {
      console.error("Error fetching order acceptance doc ids:", error);
      throw error;
    }
  },

  // Get Order Acceptance items for a selected docId (Sales Agreement No).
  // Response: paramObjectsMap.items = [{ itemId, itemCode, itemDescitpion, orderId, quantity }]
  getOrderAcceptanceItemDetailsDetails: async (docId) => {
    try {
      const res = await apiClient.get(
        `/api/orderAcceptance/getOrderAcceptanceItemDetailsDetails?docId=${encodeURIComponent(docId)}`,
      );
      return res?.paramObjectsMap?.items || [];
    } catch (error) {
      console.error("Error fetching order acceptance items:", error);
      throw error;
    }
  },

  // Create / Update Sales Order Short-Close
  // Payload matches the backend DTO:
  // {
  //   active, branch, cancelRemarks, createdBy, customer, docId, financialYear,
  //   id, orgId, saleOrderNo,
  //   salesOrderShortCloseDetailsDTO: [{ item, orderQty, requiredQty, suppliedQty }]
  // }
  createUpdateSalesOrderShortClose: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/orderAcceptance/createUpdateSalesOrderShort",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving sales order short-close:", error);
      throw error;
    }
  },
};

export default salesOrderShortCloseAPI;
