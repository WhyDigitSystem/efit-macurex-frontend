import apiClient from '../api/apiClient';

export const userCreationAPI = {
    // Get all users by org ID
    getAllUsers: async (orgId) => {
        try {
            const response = await apiClient.get(`/api/auth/allUsersByOrgId?orgId=${orgId}`);
            // Return the full response data
            return response;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Get user by ID
    getUserById: async (userId) => {
        try {
            const response = await apiClient.get(`/api/auth/getUserById?userId=${userId}`);
            return response.data || response;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // Save/Update user
    saveUser: async (payload) => {
        try {
            const response = await apiClient.put(`/api/auth/signup`, payload);
            return response.data || response;
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    },

    // Get all employees by org ID
    getAllEmployees: async (orgId) => {
        try {
            const response = await apiClient.get(`/api/master/getAllEmployeeByOrgId?orgId=${orgId}`);
            return response.data || response;
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw error;
        }
    },

    // Get all roles
    getAllRoles: async (orgId) => {
        try {
            const response = await apiClient.get(`/api/auth/allActiveRolesByOrgId?orgId=${orgId}`);
            return response.data || response;
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    },

    // Get all branches
    getAllBranches: async (orgId) => {
        try {
            const response = await apiClient.get(`/api/commonmaster/getBranchByOrgId?orgId=${orgId}`);
            return response.data || response;
        } catch (error) {
            console.error('Error fetching branches:', error);
            throw error;
        }
    },
};