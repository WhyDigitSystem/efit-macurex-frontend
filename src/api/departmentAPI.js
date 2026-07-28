import apiClient from './apiClient';

export const departmentAPI = {
    // Get all departments
    getAllDepartments: async (orgId, branch) => {
        try {
            const response = await apiClient.get(`/api/efitmaster/getAllDepartmentByOrgId?orgId=${orgId}&branch=${branch}`);
            return response;
        } catch (error) {
            console.error('Error fetching departments:', error);
            throw error;
        }
    },

    // Get department by ID
    getDepartmentById: async (id) => {
        try {
            const response = await apiClient.get(`/api/efitmaster/getDepartmentById?id=${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching department:', error);
            throw error;
        }
    },

    // Save/Update department
    saveDepartment: async (payload) => {
        try {
            const response = await apiClient.put(`/api/efitmaster/createUpdateDepartment`, payload);
            return response;
        } catch (error) {
            console.error('Error saving department:', error);
            throw error;
        }
    },
};