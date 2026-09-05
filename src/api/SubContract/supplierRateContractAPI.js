import apiClient from '../apiClient';

const supplierRateContractAPI = {
    // Create or update supplier rate contract
    createUpdateSupplierRateContract: async (payload) => {
        try {
            const response = await apiClient.put(
                `/api/subContract/createUpdateSupplierRateContract`,
                payload
            );
            return response;
        } catch (error) {
            console.error('Error saving supplier rate contract:', error);
            throw error;
        }
    },

    // Get supplier rate contract by ID
    getSupplierRateContractById: async (id) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractById?id=${id}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching supplier rate contract:', error);
            throw error;
        }
    },

    // Get all supplier rate contracts
    getAllSupplierRateContracts: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getAllSupplierRateContract?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching supplier rate contracts:', error);
            throw error;
        }
    },

    // Get supplier rate contracts by org ID and branch (NEW)
    getSupplierRateContractByOrgId: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractByOrgIdAndBranch?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching supplier rate contracts by org:', error);
            throw error;
        }
    },

    // Get customers for supplier rate contract
    getCustomersForSupplierRateContract: async (branch, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getCustomerForSupplierRateContract?branch=${branch}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching customers for supplier rate contract:', error);
            throw error;
        }
    },

    // Get supplier rate contract document ID
    getSupplierRateContractDocId: async (financialYear, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractDocId?financialYear=${financialYear}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching supplier rate contract document ID:', error);
            throw error;
        }
    },

    // Get services for supplier rate contract
    getServicesForSupplierRateContract: async (branch, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getServiceForSupplierRateContract?branch=${branch}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching services for supplier rate contract:', error);
            throw error;
        }
    },

    // Get supplier rate contract item dropdown
    getSupplierRateContractItemDropdown: async (branch, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractItemDropdown?branch=${branch}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching supplier rate contract item dropdown:', error);
            throw error;
        }
    },
};

export default supplierRateContractAPI;