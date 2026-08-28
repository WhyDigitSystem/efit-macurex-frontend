import apiClient from "../apiClient";

const internalIndentAPI = {
  // ============================================================
  // GET INTERNAL INDENT DOCUMENT ID
  // ============================================================
  getInternalIndentDocId: async ({ orgId, financialYear }) => {
    try {
      const response = await apiClient.get(
        "/api/purchasedeliveryschedule/getInternalIndentDocId",
        {
          params: {
            orgId: Number(orgId),
            financialYear: String(financialYear),
          },
        },
      );

      console.log("Internal Indent Doc ID response:", response);

      return response?.paramObjectsMap?.internalIndentDocId || "";
    } catch (error) {
      console.error(
        "Error fetching Internal Indent document ID:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  // ============================================================
  // GET INTERNAL INDENT BY ID
  // ============================================================
  getInternalIndentById: async (id) => {
    try {
      const response = await apiClient.get(
        "/api/purchasedeliveryschedule/getInternalIndentById",
        {
          params: {
            id: Number(id),
          },
        },
      );

      console.log("Internal Indent by ID response:", response);

      return response?.paramObjectsMap?.internalIndentVO || null;
    } catch (error) {
      console.error(
        "Error fetching Internal Indent by ID:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  // ============================================================
  // GET INTERNAL INDENTS
  // ============================================================
  getInternalIndentByOrgId: async (orgId, branchId) => {
    try {
      const response = await apiClient.get(
        "/api/purchasedeliveryschedule/getInternalIndentByOrgId",
        {
          params: {
            orgId: Number(orgId),
            branch: Number(branchId),
          },
        },
      );

      console.log("Internal Indents response:", response);

      return response?.paramObjectsMap?.internalIndentVO || [];
    } catch (error) {
      console.error(
        "Error fetching Internal Indents:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  // ============================================================
  // CREATE / UPDATE INTERNAL INDENT
  // PUT
  // /api/purchasedeliveryschedule/updateCreateInternalIndent
  // ============================================================
  updateCreateInternalIndent: async (payload) => {
    try {
      console.log("========== API INTERNAL INDENT PAYLOAD ==========");

      console.log(JSON.stringify(payload, null, 2));

      const response = await apiClient.put(
        "/api/purchasedeliveryschedule/updateCreateInternalIndent",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("========== API INTERNAL INDENT RESPONSE ==========");

      console.log(response);

      return response;
    } catch (error) {
      console.error("========== INTERNAL INDENT API ERROR ==========");

      console.error("Status:", error?.response?.status);

      console.error("Response:", error?.response?.data);

      throw error;
    }
  },
};

export default internalIndentAPI;
