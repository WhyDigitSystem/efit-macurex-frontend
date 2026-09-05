import apiClient from '../apiClient';

const jobOrderAPI = {
    // Create or update job order
    createUpdateJobOrder: async (formData) => {
        try {
            const response = await apiClient.put(
                `/api/subContract/createUpdateJobOrder`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response;
        } catch (error) {
            console.error('Error saving job order:', error);
            throw error;
        }
    },

    // Get job order by ID
    getJobOrderById: async (id) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getJobOrderById?id=${id}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching job order:', error);
            throw error;
        }
    },

    // Get all job orders
    getAllJobOrders: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getAllJobOrder?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching job orders:', error);
            throw error;
        }
    },

    // Get job orders by org ID and branch
    getJobOrderByOrgId: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getJobOrderByOrgIdAndBranch?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching job orders by org:', error);
            throw error;
        }
    },

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

    // Get job order document ID
    getJobOrderDocId: async (financialYear, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getJobOrderDocId?financialYear=${financialYear}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching job order document ID:', error);
            throw error;
        }
    },

    getSupplierRateContractForJobOrder: async (branch, customer, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractforJobOrder?branch=${branch}&customer=${customer}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching supplier rate contract for job order:', error);
            throw error;
        }
    },

    // Get supplier rate contract item details for job order
    getSupplierRateContractItemDetailsForJobOrder: async (branch, contractNo, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractItemDetailsForJobOrder?branch=${branch}&contractNo=${encodeURIComponent(contractNo)}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching supplier rate contract item details for job order:', error);
            throw error;
        }
    },
};

export default jobOrderAPI;