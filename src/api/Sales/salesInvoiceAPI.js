import apiClient from "../apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const salesInvoiceAPI = {

    // Get customer details for Sales Invoice/Rejection
    getCustomerDetails: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/transaction/getCustomerDetailsforSalesRejectionInvoice?branch=${branchId}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching customer details:", error);
            throw error;
        }
    },

    // Get currency details for Sales Invoice
    getCurrencyDetails: async (orgId, branchId, customerId) => {
        try {
            const response = await apiClient.get(
                `/api/transaction/getCurrencyforSalesRejectionInv?branch=${branchId}&customer=${customerId}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching currency details:", error);
            throw error;
        }
    },

    // Get auto-generated document ID for Sales Invoice/Rejection
    getSalesRejectionInvoiceDocId: async (orgId, docType, financialYear = "2026") => {
        try {
            const response = await apiClient.get(
                `/api/transaction/getSalesRejectionInvoiceDocId?docType=${docType}&financialYear=${financialYear}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching document ID:", error);
            throw error;
        }
    },

    // Get Despatch Instruction details
    getDespatchInstructionDetails: async (orgId, branchId, customerId, docType) => {
        try {
            const response = await apiClient.get(
                `/api/transaction/getDespatchInstructionNoforSalesRejectionInv?branch=${branchId}&customer=${customerId}&docType=${docType}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching despatch instruction details:", error);
            throw error;
        }
    },

    // Get Month Year for Sales Rejection Invoice
    getMonthYearForSalesRejectionInv: async (orgId, branchId, docId) => {
        try {
            const encodedDocId = encodeURIComponent(docId);
            const response = await apiClient.get(
                `/api/transaction/getMonthYearForSalesRejectionInv?branch=${branchId}&docId=${encodedDocId}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching month/year details:", error);
            throw error;
        }
    },

    // NEW: Get Item Details for Sales Rejection Invoice
    getItemDetailsForSalesRejectionInvoice: async (orgId, branchId, dispatchInstructionDocId) => {
        try {
            const response = await apiClient.get(
                `/api/transaction/getItemDetailsforSalesRejectionInvoice?branch=${branchId}&dispatchInstructiondocId=${dispatchInstructionDocId}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching item details:", error);
            throw error;
        }
    },

    // Create or update sales contract with FormData
    createUpdateSalesInvoice: async (formData) => {
        try {
            const response = await apiClient.put(
                `/api/transaction/createUpdateSalesRejectionInvoice`,
                formData
            );
            return response;
        } catch (error) {
            console.error("Error creating/updating sales invoice:", error);
            throw error;
        }
    },

    // Get sales contract by ID
    getSalesInvoiceById: async (salesContractId) => {
        try {
            const response = await apiClient.get(
                `/api/transaction/getSalesRejectionInvoiceById?id=${salesContractId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching sales contract:", error);
            throw error;
        }
    },

    getSalesInvoiceByOrgId: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/transaction/getSalesRejectionInvoiceByOrgId?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching Sales Invoice details:", error);
            throw error;
        }
    },

    getItemMasterDetails: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/itemMaster/getItemMasterByOrgId?orgId=${orgId}&branchId=${branchId}`
            );
            return response;
        } catch (error) {
            console.error("Error fetching item master details:", error);
            throw error;
        }
    },


};

export default salesInvoiceAPI;