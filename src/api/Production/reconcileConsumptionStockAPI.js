import apiClient from "../apiClient";

const reconcileConsumptionStockAPI = {
    /* ---------------- List by Org + Branch ---------------- */
    getByOrgIdAndBranch: async ({ orgId, branch }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getReconcileConsumptionStockByOrgIdAndBranch?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.reconcileConsumptionStockList || [];
        } catch (error) {
            console.error("Error fetching reconcile records:", error);
            throw error;
        }
    },

    /* ---------------- Get by Id ---------------- */
    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getReconcileConsumptionStockById?id=${id}`,
            );
            return res?.paramObjectsMap?.reconcileConsumptionStock || null;
        } catch (error) {
            console.error("Error fetching reconcile record:", error);
            throw error;
        }
    },

    /* ---------------- Doc Id ---------------- */
    getDocId: async ({ financialYear, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getReconcileConsumptionStockDocId?financialYear=${financialYear}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.reconcileConsumptionStockDocId || "";
        } catch (error) {
            console.error("Error fetching Reconcile Doc Id:", error);
            throw error;
        }
    },

    /* ---------------- Shop Floors (locations) ---------------- */
    getShopFloors: async ({ orgId, branch }) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getLocationByOrgId?orgId=${orgId}&branch=${branch}`,
            );
            return res?.paramObjectsMap?.transportList || [];
        } catch (error) {
            console.error("Error fetching shop floors:", error);
            throw error;
        }
    },

    /* ---------------- RM Locations (same source) ---------------- */
    getRMLocations: async ({ orgId, branch }) => {
        try {
            const res = await apiClient.get(
                `/api/commonmaster/getLocationByOrgId?orgId=${orgId}&branch=${branch}`,
            );
            return res?.paramObjectsMap?.transportList || [];
        } catch (error) {
            console.error("Error fetching RM locations:", error);
            throw error;
        }
    },

    /* ---------------- FG Items ---------------- */
    getFGItems: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/subContract/getFGItemsforBOMCorrectionRequestNote?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.itemDetails || [];
        } catch (error) {
            console.error("Error fetching FG items:", error);
            throw error;
        }
    },

    /* ---------------- BOM Item Details ---------------- */
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
                "/api/subContract/createUpdateReconcileConsumptionStock",
                payload,
            );
            return res;
        } catch (error) {
            console.error("Error saving reconcile record:", error);
            throw error;
        }
    },
};

export default reconcileConsumptionStockAPI;