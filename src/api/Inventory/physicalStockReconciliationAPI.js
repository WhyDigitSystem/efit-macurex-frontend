import apiClient from "../apiClient";

const LIST_CODE_LOCATION_TYPE = "LOCATION TYPE";
const LIST_CODE_BELONGS_TO = "PARTY BELONGS TO";

export const physicalStockReconciliationAPI = {
  /* ================================================================
     CREATE / UPDATE
  ================================================================ */

  updateCreateReconciliation: async (physicalStockReConcilationDTO) => {
    try {
      const res = await apiClient.put(
        "/api/purchasedeliveryschedule/updateCreatePhysicalStockReConcilation",
        physicalStockReConcilationDTO,
      );

      return res?.data ?? res;
    } catch (error) {
      console.error(
        "Error creating/updating physical stock reconciliation:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET BY ID
  ================================================================ */

  getReconciliationById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/purchasedeliveryschedule/getPhysicalStockReConcilationById",
        {
          params: { id },
        },
      );

      const data = res?.data ?? res;

      return (
        data?.paramObjectsMap?.physicalStockReConcilationVO ||
        data?.paramObjectsMap?.reConcilationVO ||
        null
      );
    } catch (error) {
      console.error(
        "Error fetching physical stock reconciliation by ID:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     GET BY ORG
  ================================================================ */

  getReconciliationByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/purchasedeliveryschedule/getPhysicalStockReConcilationByOrgId",
        {
          params: {
            orgId: Number(orgId),
            branch: Number(branch),
          },
        },
      );

      const data = res?.data ?? res;

      console.log("GET Physical Stock Reconciliation Response:", data);

      return data?.paramObjectsMap?.physicalStockReConcilationVO || [];
    } catch (error) {
      console.error(
        "Error fetching physical stock reconciliation list:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     DOC ID
  ================================================================ */

  getReconciliationDocId: async ({ financialYear, orgId }) => {
    try {
      const apiFinancialYear = String(financialYear).split("-")[0];

      const res = await apiClient.get(
        "/api/purchasedeliveryschedule/getPhysicalStockReConcilationDocId",
        {
          params: {
            financialYear: apiFinancialYear,
            orgId: Number(orgId),
          },
        },
      );

      const data = res?.data ?? res;

      return data?.paramObjectsMap?.reConcilationDocId || "";
    } catch (error) {
      console.error(
        "Error fetching reconciliation doc id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  /* ================================================================
     LOCATION DROPDOWN
     (needs branch + locationType id, which comes from
     getListOfValuesByOrgId's "LOCATION TYPE" group)
  ================================================================ */

  getLocationDropdown: async (branch, locationType, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/purchasedeliveryschedule/getLocationDropdownForPhysicalStockReConcilation",
        {
          params: { branch, locationType, orgId },
        },
      );

      const data = res?.data ?? res;

      const list = data?.paramObjectsMap?.locationDropdown || [];

      return list.map((loc) => ({
        value: loc.id,
        label: loc.locationName || loc.locationId || `Location ${loc.id}`,
        locationId: loc.locationId || "",
      }));
    } catch (error) {
      console.error(
        "Error fetching location dropdown:",
        error?.response?.data || error,
      );

      return [];
    }
  },

  /* ================================================================
     COMMON MASTER - list of values by org
     Used to resolve LOCATION TYPE and BELONGS TO dropdown options.
  ================================================================ */

  getListOfValuesByOrgId: async (branchId, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/commonmaster/getListOfValuesByOrgId",
        {
          params: { branchId, orgId },
        },
      );

      const data = res?.data ?? res;

      return data?.paramObjectsMap?.listOfValues || [];
    } catch (error) {
      console.error(
        "Error fetching list of values:",
        error?.response?.data || error,
      );

      return [];
    }
  },

  getLocationTypeOptions: async (branchId, orgId) => {
    const listOfValues =
      await physicalStockReconciliationAPI.getListOfValuesByOrgId(
        branchId,
        orgId,
      );

    const group = listOfValues.find(
      (g) => g.listDescription === LIST_CODE_LOCATION_TYPE,
    );

    const details = group?.listOfValuesDetailsVO || [];

    return details.map((d) => ({
      value: d.id,
      label: d.valueDescription || d.valueCode,
    }));
  },

  getBelongsToOptions: async (branchId, orgId) => {
    const listOfValues =
      await physicalStockReconciliationAPI.getListOfValuesByOrgId(
        branchId,
        orgId,
      );

    const group = listOfValues.find(
      (g) => g.listDescription === LIST_CODE_BELONGS_TO,
    );

    const details = group?.listOfValuesDetailsVO || [];

    return details.map((d) => ({
      value: d.valueDescription || d.valueCode,
      label: d.valueDescription || d.valueCode,
    }));
  },
};

export default physicalStockReconciliationAPI;
