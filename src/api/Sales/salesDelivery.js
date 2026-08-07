// src/api/Sales/salesDelivery.js

import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const salesDeliveryAPI = {
    getCustomerDropdown: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/transaction/getCustomerDetails?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching customers:", error);
            throw error;
        }
    },

    getContractNoDetails: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/transaction/getContractNoDropdown?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching contract numbers:", error);
            throw error;
        }
    },

    // Create or update sales delivery with FormData
    createUpdateSalesDelivery: async (formData) => {
        try {
            const response = await apiClient.post(
                `${API_BASE_URL}/api/dhinesh/createUpdateSalesDelivery`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response;
        } catch (error) {
            console.error("Error creating/updating sales delivery:", error);
            throw error;
        }
    },

    // Get sales contract by ID
    getSalesDeliveryById: async (salesContractId) => {
        try {
            const response = await apiClient.get(
                `/api/dhinesh/getSalesDeliveryById?id=${salesContractId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching sales contract:", error);
            throw error;
        }
    },

    // Get all sales contracts by OrgId and BranchId
    getSalesDelivery: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/dhinesh/getSalesContractByOrgIdAndBranch?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching sales contracts:", error);
            throw error;
        }
    },
};

export default salesDeliveryAPI;