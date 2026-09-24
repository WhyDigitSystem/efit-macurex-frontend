import apiClient from "../apiClient";

const productionScheduleOrderAPI = {
    /* ---------------- List by Org + Branch ---------------- */
    getByOrgIdAndBranch: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getProductionScheduleOrderByOrgId?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.productionScheduleOrderResponseVO || [];
        } catch (error) {
            console.error("Error fetching production schedule orders:", error);
            throw error;
        }
    },

    /* ---------------- Get by Id ---------------- */
    getById: async (id) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getProductionScheduleOrderById?id=${id}`,
            );
            return res?.paramObjectsMap?.productionScheduleOrderResponseVO || null;
        } catch (error) {
            console.error("Error fetching production schedule order by id:", error);
            throw error;
        }
    },

    /* ---------------- Doc Id ---------------- */
    getDocId: async ({ financialYear, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getProductionScheduleOrderDocId?financialYear=${financialYear}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.productionScheduleOrderDocId || "";
        } catch (error) {
            console.error("Error fetching PSO Doc Id:", error);
            throw error;
        }
    },

    /* ---------------- List-of-values (Sch. Order Type) ---------------- */
    getListValuesGroup: async (listDescription, orgId) => {
        try {
            const res = await apiClient.get("/api/commonmaster/getListValuesGroup", {
                params: { listDescription, orgId },
            });
            return res?.paramObjectsMap?.listValues || [];
        } catch (error) {
            console.error(
                `Error fetching list values group "${listDescription}":`,
                error,
            );
            throw error;
        }
    },

    /* ---------------- FG / SFG Items ---------------- */
    getFgAndSfgItems: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getFgAndSfgItemDetailsFromProduction?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching FG/SFG items:", error);
            throw error;
        }
    },

    /* ---------------- Process Sheet Routing ---------------- */
    getProcessSheetRouting: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/develop/getProcessSheetCompRoutingByOrgId?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.processSheetCompRoutingResponseVO || [];
        } catch (error) {
            console.error("Error fetching process sheet routing:", error);
            throw error;
        }
    },

    /* ---------------- Bill Of Materials ---------------- */
    getBomList: async ({ branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getBillOfMaterialByOrgId?branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.billOfMaterialResponseVO || [];
        } catch (error) {
            console.error("Error fetching BOM list:", error);
            throw error;
        }
    },

    /* ---------------- Item details by BOM ---------------- */
    getItemsByBom: async ({ bom, branch, orgId }) => {
        try {
            const res = await apiClient.get(
                `/api/purchaseOrder/getFgAndSfgItemDetailsFromProductionDetails?bom=${bom}&branch=${branch}&orgId=${orgId}`,
            );
            return res?.paramObjectsMap?.mapp || [];
        } catch (error) {
            console.error("Error fetching items by BOM:", error);
            throw error;
        }
    },

    /* ---------------- Save (create / update) ---------------- */
    createUpdate: async (payload) => {
        try {
            const res = await apiClient.put(
                "/api/purchaseOrder/createUpdateProductionScheduleOrder",
                payload,
            );
            return res;
        } catch (error) {
            console.error("Error saving production schedule order:", error);
            throw error;
        }
    },
};

export default productionScheduleOrderAPI;