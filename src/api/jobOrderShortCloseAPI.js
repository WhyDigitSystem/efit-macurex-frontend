// jobOrderShortCloseAPI.js
import apiClient from "./apiClient";

const jobOrderShortCloseAPI = {
  /* ==========================================================================
     CRUD — Job Order Short Close record itself (subContract module)
  ========================================================================== */

  // Response: paramObjectsMap.jobOrderShortClose[]
  getJobOrderShortCloseByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getJobOrderShortCloseByOrgIdAndBranch",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.jobOrderShortClose || [];
    } catch (error) {
      console.error("Error fetching job order short closes:", error);
      throw error;
    }
  },

  // Response: paramObjectsMap.jobOrderShortClose (single object)
  getJobOrderShortCloseById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getJobOrderShortCloseById",
        { params: { id } },
      );
      return res?.paramObjectsMap?.jobOrderShortClose || null;
    } catch (error) {
      console.error("Error fetching job order short close by ID:", error);
      throw error;
    }
  },

  // Body must match the backend DTO exactly:
  // { active, branch, cancelRemarks, createdBy, customer, financialYear, id,
  //   jobOrderNo, jobOrderShortCloseDetails: [{ id, item, orderQty, pendingQty,
  //   requiredQty, shortCloseQty, suppliedQty }], orgId, referenceForSc }
  createUpdateJobOrderShortClose: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/subContract/createUpdateJobOrderShortClose",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving job order short close:", error);
      throw error;
    }
  },

  // Auto-generated Short Close No for a new record.
  // Response: paramObjectsMap.jobOrderShortCloseDocId
  getJobOrderShortCloseDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getJobOrderShortCloseDocId",
        { params: { financialYear, orgId } },
      );
      return res?.paramObjectsMap?.jobOrderShortCloseDocId || "";
    } catch (error) {
      console.error("Error fetching job order short close doc id:", error);
      throw error;
    }
  },

  /* ==========================================================================
     Customer lookup — used for "Customer Id" (customerCode), "Customer Name"
     (customerName), and "GRN No" (gstNo, per the field mapping you gave)
  ========================================================================== */

  // Response: paramObjectsMap.customerList[]
  //   { customerId, customerCode, customerName, address, gstStateId,
  //     gstState, gstNo, gstType, igstApplicable }
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

  /* ==========================================================================
     Job Order No lookup — used for "Job Order No", scoped to the selected
     customer. NOTE: this endpoint wasn't in the provided Swagger docs, so the
     response-key parsing below is defensive/best-effort — verify the actual
     key (jobOrderNoAndDate vs jobOrderDetails vs mapp, etc.) against your
     backend and tighten this once confirmed.
  ========================================================================== */

  getJobOrderNoAndDateForJobOrderAmd: async (branch, customer, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getJobOrderNoAndDateForJobOrderAmd",
        {
          params: {
            branch,
            customer,
            orgId,
          },
        },
      );

      console.log("Job Order API Response:", res);

      return res?.paramObjectsMap?.jobOrderList || [];
    } catch (error) {
      console.error("Error fetching job order no/date list:", error);
      throw error;
    }
  },

  /* ==========================================================================
     Item lookup — used for "Item Code" / "Item Description" in the detail
     table, scoped to the selected customer + job order no
  ========================================================================== */

  // Response: paramObjectsMap.jobOrderItemDetails[]
  //   { id, item, itemCode, itemDescription, unit, unitDescription, rate,
  //     bom, deliveryDate }
  // NOTE: "item" here is the item master id — that's what should be sent as
  // "item" in the jobOrderShortCloseDetails payload and passed as the "item"
  // param to getTotalSuppliedQtyforJobOrderClose below.
  getJobOrderItemDetailsForJobOrderAmd: async (
    branch,
    customer,
    jobOrderNo,
    orgId,
  ) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getJobOrderItemDetailsForJobOrderAmd",
        { params: { branch, customer, jobOrderNo, orgId } },
      );
      return res?.paramObjectsMap?.jobOrderItemDetails || [];
    } catch (error) {
      console.error("Error fetching job order item details:", error);
      throw error;
    }
  },

  /* ==========================================================================
     Supplied Qty lookup — used for "Supplied Qty" per detail row
  ========================================================================== */

  // Response: paramObjectsMap.issueQty[0].issueQty
  getTotalSuppliedQtyforJobOrderClose: async (
    branch,
    item,
    jobOrderNo,
    orgId,
  ) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getTotalSuppliedQtyforJobOrderClose",
        { params: { branch, item, jobOrderNo, orgId } },
      );
      const list = res?.paramObjectsMap?.issueQty || [];
      return list[0]?.issueQty ?? 0;
    } catch (error) {
      console.error("Error fetching total supplied qty:", error);
      throw error;
    }
  },
};

export default jobOrderShortCloseAPI;
