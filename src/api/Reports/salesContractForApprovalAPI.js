import apiClient from "../apiClient";

const salesContractForApprovalAPI = {
  // ---------------- Sales Contract For Approval Report ----------------
  getSalesContractForApprovalReport: async ({
    branch,
    fromDate,
    orgId,
    toDate,
  }) => {
    try {
      const res = await apiClient.get(
        "/api/vendorComplaintEntry/getSalesContractForApprovalReport",
        {
          params: {
            branch,
            fromDate,
            orgId,
            toDate,
          },
        },
      );

      return res?.paramObjectsMap?.salesContractList || [];
    } catch (error) {
      console.error(
        "Error fetching Sales Contract For Approval Report:",
        error,
      );
      throw error;
    }
  },
};

export default salesContractForApprovalAPI;
