import apiClient from "./apiClient";

const listOfValuesAPI = {
  getListOfValuesByOrgId: async (branchId, orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getListOfValuesByOrgId?branchId=${branchId}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.listOfValues || [];
    } catch (error) {
      console.error("Error fetching List Of Values:", error);
      throw error;
    }
  },

  // Fetch all groups for this branch/org, then return ONE group's raw
  // detail rows by listCode (e.g. "MODULE", "TAX") — unmapped, exactly as
  // the API returns them: [{ id, valueCode, valueDescription, active }, ...]
  getListValuesGroup: async (listCode, branchId, orgId) => {
    try {
      const groups = await listOfValuesAPI.getListOfValuesByOrgId(
        branchId,
        orgId,
      );

      const group = groups.find(
        (g) =>
          String(g.listCode).trim().toUpperCase() ===
          String(listCode).trim().toUpperCase(),
      );

      const details = group?.listOfValuesDetailsVO || [];

      return details.filter((d) => d.active !== false);
    } catch (error) {
      console.error(`Error fetching list values group "${listCode}":`, error);
      throw error;
    }
  },
};

export default listOfValuesAPI;
