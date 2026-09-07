import apiClient from '../apiClient';

const supplierRateContractAmendmentAPI = {
    // Create or Update Supplier Rate Contract Amendment
    createUpdateSupplierRateContractAmendment: async (payload) => {
        try {
            const response = await apiClient.put(
                `/api/subContract/createUpdateSupplierRateContractAmendment`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response;
        } catch (error) {
            console.error('Error saving supplier rate contract amendment:', error);
            throw error;
        }
    },

    // Get all Supplier Rate Contract Amendments by Org ID and Branch
    getSupplierRateContractAmendmentByOrgIdAndBranch: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractAmendmentByOrgIdAndBranch?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching supplier rate contract amendments:', error);
            throw error;
        }
    },

    // Get Supplier Rate Contract for Job Order
    getSupplierRateContractforJobOrder: async (branch, customer, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractforJobOrder?branch=${branch}&customer=${customer}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching supplier rate contract:', error);
            throw error;
        }
    },

    // Get Supplier Rate Contract Amendment by ID
    getSupplierRateContractAmendmentById: async (id) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractAmendmentById?id=${id}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching supplier rate contract amendment:', error);
            throw error;
        }
    },

    // Get Supplier Rate Contract Amendment Document ID
    getSupplierRateContractAmendmentDocId: async (financialYear, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractAmendmentDocId?financialYear=${financialYear}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching document ID:', error);
            throw error;
        }
    },

    // Get Supplier Rate Contract Amendment Item Details
    getSupplierRateContractAmendmentItemDetails: async (branch, contractNo, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractItemDetailsForSRCAmd?branch=${branch}&contractNo=${encodeURIComponent(contractNo)}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching supplier rate contract amendment item details:', error);
            throw error;
        }
    },
};

export default supplierRateContractAmendmentAPI;