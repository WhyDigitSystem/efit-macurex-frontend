import apiClient from "../apiClient";

const bulkIssueIndentAPI = {
    /* ---------------- List by Org + Branch ---------------- */
    getByOrgIdAndBranch: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getBulkIssueIndentByOrgIdAndBranch?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.bulkIssueIndentList || [];
        } catch (error) {
            console.error("Error fetching Bulk Issue Indents:", error);
            throw error;
        }
    },

    /* ---------------- Get by Id ---------------- */
    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getBulkIssueIndentById?id=${id}`,
            );
            return res?.paramObjectsMap?.bulkIssueIndent || null;
        } catch (error) {
            console.error("Error fetching Bulk Issue Indent by id:", error);
            throw error;
        }
    },

    /* ---------------- Doc Id ---------------- */
    getDocId: async ({ financialYear, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getBulkIssueIndentDocId?financialYear=${financialYear}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.bulkIssueIndentDocId || "";
        } catch (error) {
            console.error("Error fetching Bulk Issue Indent DocId:", error);
            throw error;
        }
    },

    /* ---------------- FG / SFG Items ---------------- */
    getFGAndSFGItems: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getFGAndSFGItems?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.itemDetails || [];
        } catch (error) {
            console.error("Error fetching FG/SFG items:", error);
            throw error;
        }
    },

    /* ---------------- BOM Item Details (per FG/SFG item) ---------------- */
    getBomItemDetails: async ({ branch, itemId, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getBomItemDetailsforSubContractingGRN?branch=${branch}&itemId=${itemId}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.BomItemDetailsVO || [];
        } catch (error) {
            console.error("Error fetching BOM item details:", error);
            throw error;
        }
    },

    /* ---------------- Save (create / update) ---------------- */
    createUpdate: async (payload) => {
        try {
            const res = await apiClient.post(
                "/api/subContract/createUpdateBulkIssueIndent",
                payload,
            );
            return res;
        } catch (error) {
            console.error("Error saving Bulk Issue Indent:", error);
            throw error;
        }
    },
};

export default bulkIssueIndentAPI;