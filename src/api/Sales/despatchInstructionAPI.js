// despatchInstructionAPI.js
import apiClient from "../apiClient";

/* Despatch Instruction API
   Mirrors the commonmaster/dev API convention used across this app.
   The backend persists the despatch instruction header + details in a
   single transaction (server-side validation). */
const despatchInstructionAPI = {
  // Get Despatch Instructions by Organization ID
  getDispatchByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        `/api/dev/getDespatchInstructionByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.despatchInstructionEntryVO || [];
    } catch (error) {
      console.error("Error fetching despatch instructions:", error);
      throw error;
    }
  },

  // Create / Update Despatch Instruction
  createUpdateDispatch: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/dev/updateCreateDespatchInstruction",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving despatch instruction:", error);
      throw error;
    }
  },
};

export default despatchInstructionAPI;
