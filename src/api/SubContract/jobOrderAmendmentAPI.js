import apiClient from "../apiClient";

/* ================================================================
   JOB ORDER AMENDMENT API

   Base path: /api/subContract/...

   NOTE: this file is a full rewrite based on the swagger endpoints
   shared for this module. If your project already has a
   jobOrderAmendmentAPI.js with additional methods in use elsewhere,
   merge these in rather than overwriting wholesale.
================================================================ */

const jobOrderAmendmentAPI = {
  /* ================================================================
     STEP 1 — CUSTOMERS FOR SUPPLIER RATE CONTRACT

     Populates the Party Id / Party Name dropdown.

     Swagger: GET /api/subContract/getCustomerForSupplierRateContract
              ?branch=...&orgId=...

     Response: paramObjectsMap.customerList[]
       { customerId, customerName, customerCode, address, gstNo, ... }
  ================================================================ */

  getCustomerForSupplierRateContract: async (branch, orgId) => {
    try {
      const response = await apiClient.get(
        "/api/subContract/getCustomerForSupplierRateContract",
        {
          params: { branch, orgId },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.customerList || [];
    } catch (error) {
      console.error(
        "Error fetching customers for supplier rate contract:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     STEP 2 — JOB ORDER NO + DATE FOR THE SELECTED CUSTOMER

     Populates the Job Order No dropdown; each option also carries
     the Job Order Date.

     Swagger: GET /api/subContract/getJobOrderNoAndDateForJobOrderAmd
              ?branch=...&customer=...&orgId=...

     Response: paramObjectsMap.jobOrderList[]
       { id, jobOrderNo, jobOrderDate }
  ================================================================ */

  getJobOrderNoAndDateForJobOrderAmd: async (branch, customer, orgId) => {
    try {
      const response = await apiClient.get(
        "/api/subContract/getJobOrderNoAndDateForJobOrderAmd",
        {
          params: { branch, customer, orgId },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.jobOrderList || [];
    } catch (error) {
      console.error(
        "Error fetching job order no/date for amendment:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     STEP 3 — NEXT REVISION NO FOR THE SELECTED JOB ORDER

     Swagger: GET /api/subContract/getNextRevisionNoForJobOrderAmd
              ?branch=...&jobOrderNo=...&orgId=...

     Response: paramObjectsMap.revisionNo (number)
  ================================================================ */

  getNextRevisionNoForJobOrderAmd: async (branch, jobOrderNo, orgId) => {
    try {
      const response = await apiClient.get(
        "/api/subContract/getNextRevisionNoForJobOrderAmd",
        {
          params: { branch, jobOrderNo, orgId },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.revisionNo ?? 1;
    } catch (error) {
      console.error(
        "Error fetching next revision no:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     DOC ID FOR A NEW AMENDMENT

     Swagger: GET /api/subContract/getJobOrderAmendmentDocId
              ?financialYear=...&orgId=...

     Response: paramObjectsMap.jobOrderAmendmentDocId (string)

     NOTE: docId is informational only — it is NOT part of the
     createUpdateJobOrderAmendment request schema, so it is never
     sent in the save payload.
  ================================================================ */

  getJobOrderAmendmentDocId: async (financialYear, orgId) => {
    try {
      const response = await apiClient.get(
        "/api/subContract/getJobOrderAmendmentDocId",
        {
          params: { financialYear, orgId },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.jobOrderAmendmentDocId || "";
    } catch (error) {
      console.error(
        "Error fetching job order amendment doc id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     STEP 4 — LINE ITEMS FOR THE SELECTED JOB ORDER

     Populates the Job Order Details table. Each row already carries
     the numeric item id and unit id needed for the save payload
     (jobOrderAmendmentDetails[].item / .unit) — no separate item or
     unit master lookup is required to resolve them.

     Swagger: GET /api/subContract/getJobOrderItemDetailsForJobOrderAmd
              ?branch=...&customer=...&jobOrderNo=...&orgId=...

     Response: paramObjectsMap.jobOrderItemDetails[]
       { id, bom, item, unit, rate, itemCode, itemDescription,
         unitDescription, deliveryDate }
  ================================================================ */

  getJobOrderItemDetailsForJobOrderAmd: async (
    branch,
    customer,
    jobOrderNo,
    orgId,
  ) => {
    try {
      const response = await apiClient.get(
        "/api/subContract/getJobOrderItemDetailsForJobOrderAmd",
        {
          params: { branch, customer, jobOrderNo, orgId },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.jobOrderItemDetails || [];
    } catch (error) {
      console.error(
        "Error fetching job order item details for amendment:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     LIST / EDIT SUPPORT
  ================================================================ */

  getJobOrderAmendmentByOrgId: async (orgId, branch) => {
    try {
      const response = await apiClient.get(
        "/api/subContract/getJobOrderAmendmentByOrgIdAndBranch",
        {
          params: { branch, orgId },
        },
      );

      const data = response?.data ?? response;

      return data?.paramObjectsMap?.jobOrderAmendment || [];
    } catch (error) {
      console.error(
        "Error fetching job order amendment list:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  getJobOrderAmendmentById: async (id) => {
    try {
      const response = await apiClient.get(
        "/api/subContract/getJobOrderAmendmentById",
        {
          params: { id },
        },
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error fetching job order amendment by id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     CREATE / UPDATE

     Swagger: PUT /api/subContract/createUpdateJobOrderAmendment
     Body (application/json) — jobOrderAmendmentDTO:

     {
       active, branch, cancelRemarks, createdBy, customer,
       financialYear, id, jobOrderAmendmentDetails: [{ item, newQty,
       oldQty, unit }], jobOrderDate, jobOrderNo, newDeliveryDate,
       oldDeliveryDate, orgId, remarks, revisionNo
     }

     This is a PUT with a plain JSON body — NOT multipart, unlike
     ToolMaster. Do not add fields outside this schema (no docId,
     docDate, partyName, itemCode, etc.) or the backend will reject
     the request.
  ================================================================ */

  createUpdateJobOrderAmendment: async (jobOrderAmendmentDTO) => {
    try {
      const response = await apiClient.put(
        "/api/subContract/createUpdateJobOrderAmendment",
        jobOrderAmendmentDTO,
      );

      return response?.data ?? response;
    } catch (error) {
      console.error(
        "Error saving job order amendment:",
        error?.response?.data || error,
      );

      throw error;
    }
  },
};

export default jobOrderAmendmentAPI;
