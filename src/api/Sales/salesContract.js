// src/api/Sales/salesContract.js

import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const salesContractAPI = {
    getCustomerDropdown: async (orgId, branchId, ctype) => {
        try {
            const response = await apiClient.get(
                `/api/dhinesh/getCustomerDropdown?orgId=${orgId}&branch=${branchId}&ctype=${ctype}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching customers:", error);
            throw error;
        }
    },

    getQuotationDropdown: async (orgId, branchId, ctype, customerCode, recId, oldQuotationNo) => {
        try {
            let url = `/api/dhinesh/getQuotationDropdown?branch=${branchId}&ctype=${ctype}&customerCode=${customerCode}&orgId=${orgId}`;

            if (recId && recId !== 0) {
                url += `&recId=${recId}`;
            }

            if (oldQuotationNo) {
                url += `&oldQuotationNo=${oldQuotationNo}`;
            }

            const response = await apiClient.get(url);
            return response;
        } catch (error) {
            console.error("Error fetching quotations:", error);
            throw error;
        }
    },

    getQuotationItems: async (orgId, branchId, quotationNo) => {
        try {
            const response = await apiClient.get(
                `/api/dhinesh/getQuotationItemDropdown?branch=${branchId}&orgId=${orgId}&quotationNo=${quotationNo}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching quotation items:", error);
            throw error;
        }
    },

    getFinishedGoodsItems: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/dhinesh/getFinishedGoodsItems?branch=${branchId}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching finished goods items:", error);
            throw error;
        }
    },

    // Create or update sales contract with FormData
    createUpdateSalesContract: async (formData) => {
        try {
            const response = await apiClient.post(
                `${API_BASE_URL}/api/dhinesh/createUpdateSalesContract`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response;
        } catch (error) {
            console.error("Error creating/updating sales contract:", error);
            throw error;
        }
    },

    // Get sales contract by ID
    getSalesContractById: async (salesContractId) => {
        try {
            const response = await apiClient.get(
                `/api/dhinesh/getSalesContractById?id=${salesContractId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching sales contract:", error);
            throw error;
        }
    },

    // Get all sales contracts by OrgId and BranchId
    getSalesContracts: async (orgId, branchId) => {
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

export default salesContractAPI;