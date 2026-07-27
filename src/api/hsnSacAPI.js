import apiClient from "./apiClient";

const hsnSacAPI = {
  getAll: async (params) => {
    const response = await apiClient.get("/hsn-sac", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/hsn-sac/${id}`);
    return response.data;
  },

  save: async (data) => {
    const response = await apiClient.post("/hsn-sac", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/hsn-sac/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/hsn-sac/${id}`);
    return response.data;
  },
};

export default hsnSacAPI;
