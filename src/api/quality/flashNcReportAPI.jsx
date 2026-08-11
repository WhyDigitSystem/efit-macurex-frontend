import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const flashNcReportAPI = {
  /*
   * Get all Flash/NC Reports.
   */
  getAll: async (orgId) => {
    const response = await axios.get(`${API_BASE_URL}/flash-nc-reports`, {
      params: {
        orgId,
      },
    });

    return response.data;
  },

  /*
   * Get Flash/NC Report by ID.
   */
  getById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/flash-nc-reports/${id}`);

    return response.data;
  },

  /*
   * Save / Update Flash/NC Report.
   *
   * FormData is used because image upload
   * is supported.
   */
  save: async (formData) => {
    const hasId = formData.get("id") !== null && formData.get("id") !== "";

    const url = hasId
      ? `${API_BASE_URL}/flash-nc-reports/${formData.get("id")}`
      : `${API_BASE_URL}/flash-nc-reports`;

    const method = hasId ? "put" : "post";

    const response = await axios({
      method,
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /*
   * Delete report.
   */
  delete: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/flash-nc-reports/${id}`,
    );

    return response.data;
  },
};

export default flashNcReportAPI;
