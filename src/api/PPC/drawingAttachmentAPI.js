import apiClient from "../apiClient";

/* Drawing Attachments API
   Mirrors the commonmaster API convention used across this app.
   The backend persists the header + attachment records in a single transaction,
   links the drawings to the FG part and keeps the complete attachment history
   for audit purposes (server-side validation). */
const drawingAttachmentAPI = {
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getDrawingAttachmentByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.drawingAttachmentList || [];
    } catch (error) {
      console.error("Error fetching drawing attachments:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/commonmaster/getDrawingAttachmentById?id=${id}`,
      );
      return res?.paramObjectsMap?.drawingAttachmentVO || null;
    } catch (error) {
      console.error("Error fetching drawing attachment by id:", error);
      throw error;
    }
  },

  createUpdate: async (data) => {
    try {
      const res = await apiClient.post(
        "/api/commonmaster/createUpdateDrawingAttachment",
        data,
      );
      return res;
    } catch (error) {
      console.error("Error saving drawing attachment:", error);
      throw error;
    }
  },
};

export default drawingAttachmentAPI;