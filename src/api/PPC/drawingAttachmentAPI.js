import apiClient from "../apiClient";

const drawingAttachmentAPI = {
  /* ---------------- List by Org ---------------- */
  getByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/develop/getDrawingAttachmentsByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.drawingAttachmentsResponseVO || [];
    } catch (error) {
      console.error("Error fetching drawing attachments:", error);
      throw error;
    }
  },

  /* ---------------- Get by Id ---------------- */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/develop/getDrawingAttachmentsById?id=${id}`,
      );
      return res?.paramObjectsMap?.drawingAttachmentsResponseVO || null;
    } catch (error) {
      console.error("Error fetching drawing attachment by id:", error);
      throw error;
    }
  },

  /* ---------------- Download (for preview) ---------------- */
  downloadFile: async (filePath) => {
    try {
      const token =
        localStorage.getItem("user.token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        JSON.parse(localStorage.getItem("user") || "{}")?.token;

      const res = await apiClient.get("/api/files/download", {
        params: { path: filePath },
        responseType: "blob",
        headers: token
          ? { Authorization: `Bearer ${String(token).replace("Bearer ", "")}` }
          : undefined,
      });

      return res; // raw blob (ApiClient may already unwrap `data`)
    } catch (error) {
      console.error("Error downloading drawing attachment:", error);
      throw error;
    }
  },

  /* ---------------- Save (multipart) ---------------- */
  createUpdate: async ({ payload, files }) => {
    try {
      const formData = new FormData();

      const dtoBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formData.append("drawingAttachments", dtoBlob, "drawingAttachments.json");

      (files || []).forEach((file) => {
        if (file instanceof File) {
          formData.append("files", file, file.name);
        }
      });

      const res = await apiClient.post(
        "/api/develop/updateCreateDrawingAttachments",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return res;
    } catch (error) {
      console.error("Error saving drawing attachment:", error);
      throw error;
    }
  },
};

export default drawingAttachmentAPI;