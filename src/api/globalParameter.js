import apiClient from "./apiClient";

export const GlobalParameterAPI = {
  getFinancialYears: async (orgId) => {
    const res = await apiClient.get("/api/commonmaster/getAllAciveFInYear", {
      params: { orgId },
    });
    return res?.paramObjectsMap?.financialYearVOs ?? [];
  },

  getBranches: async (orgid, user) => {
    const res = await apiClient.get(
      "/api/GlobalParam/globalparamBranchByUserName",
      {
        params: { orgid, user },
      }
    );
    return res?.paramObjectsMap?.GlobalParameters ?? [];
  },

  getCurrentGlobalParameters: async (orgid, userid) => {
    const res = await apiClient.get("/api/GlobalParam/globalparam/username", {
      params: { orgid, userid },
    });
    return res?.paramObjectsMap?.globalParam;
    
  },

  saveGlobalParameters: async (data) => {
    const res = await apiClient.put("/api/GlobalParam/globalparam", data);
    return res;
  },
};
