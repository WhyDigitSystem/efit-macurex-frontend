// src/api/Sales/quotationAPI.js
import apiClient from "../apiClient";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const quotationAPI = {
    // Create or update quotation with FormData
    createUpdateQuotation: async (formData) => {
        try {
            const response = await apiClient.post(
                `${API_BASE_URL}/api/quotationservice/createUpdateQuotation`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response;
        } catch (error) {
            console.error("Error creating/updating quotation:", error);
            throw error;
        }
    },

    // Get quotation by ID
    getQuotationById: async (quotationId) => {
        try {
            const response = await apiClient.get(
                `/api/quotationservice/getQuotationById?id=${quotationId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching quotation:", error);
            throw error;
        }
    },

    // Get all quotations by OrgId and BranchId
    getQuotations: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/quotationservice/getQuotationByOrgId?orgId=${orgId}&branchId=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching quotations:", error);
            throw error;
        }
    },
};

export default quotationAPI;