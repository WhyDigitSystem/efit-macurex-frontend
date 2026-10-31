import apiClient from "../apiClient";

const orderAcceptanceForApprovalAPI = {
  // ---------------- Order Acceptance For Approval Report ----------------
  getOrderAcceptanceForApprovalReport: async ({
    branch,
    fromDate,
    orgId,
    toDate,
  }) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getOrderAcceptanceForApprovalReport",
        {
          params: {
            branch,
            fromDate,
            orgId,
            toDate,
          },
        },
      );

      return res?.paramObjectsMap?.orderAcceptanceList || [];
    } catch (error) {
      console.error(
        "Error fetching Order Acceptance For Approval Report:",
        error,
      );
      throw error;
    }
  },
};

export default orderAcceptanceForApprovalAPI;
