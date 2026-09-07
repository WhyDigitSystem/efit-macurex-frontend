import apiClient from '../apiClient';

const subContractingDCAPI = {
    // Create or Update Delivery Challan Subcontracting
    createUpdateDeliveryChallanSubcontracting: async (payload) => {
        try {
            const response = await apiClient.post(
                `/api/subContract/createUpdateDeliveryChallanSubcontracting`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response;
        } catch (error) {
            console.error('Error saving delivery challan subcontracting:', error);
            throw error;
        }
    },

    // Get all Delivery Challan Subcontracting by OrgId and Branch
    getAllDeliveryChallanSubcontractingByOrgIdAndBranch: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getAllDeliveryChallanSubcontractingByOrgIdAndBranch?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching delivery challan subcontracting list:', error);
            throw error;
        }
    },

    // Get Delivery Challan Subcontracting by ID
    getDeliveryChallanSubcontractingById: async (id) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getDeliveryChallanSubcontractingById?id=${id}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching delivery challan subcontracting:', error);
            throw error;
        }
    },

    // Get Job Order No and Date for Job Order Amd
    getJobOrderNoAndDateForJobOrderAmd: async (branch, customer, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getJobOrderNoAndDateForJobOrderAmd?branch=${branch}&customer=${customer}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching job order no and date:', error);
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

    // Get customers for supplier rate contract (Vendors)
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

    // Get Location for Delivery Challan Sub Contract
    getLocationForDeliverChallanSubContract: async (branch, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getLocationForDeliverChallanSubContract?branch=${branch}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching party locations:', error);
            throw error;
        }
    },

    // Get Item Details for Delivery Challan Sub Contract
    getItemDetailsforDeliveryChallanSubContract: async (branch, jobOrderNo, orgId, vendor) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getItemDetailsforDeliveryChallanSubContract?branch=${branch}&jobOrderNo=${encodeURIComponent(jobOrderNo)}&orgId=${orgId}&vendor=${vendor}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching item details:', error);
            throw error;
        }
    },

    // Get Delivery Challan Subcontracting Document ID
    getDeliveryChallanSubcontractingDocId: async (financialYear, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getDeliveryChallanSubcontractingDocId?financialYear=${financialYear}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching delivery challan doc ID:', error);
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
};

export default subContractingDCAPI;