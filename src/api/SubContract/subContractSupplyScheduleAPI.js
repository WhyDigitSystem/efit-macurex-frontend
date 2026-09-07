import apiClient from '../apiClient';

const subContractSupplyScheduleAPI = {
    // Create or Update Sub Contract Supply Schedule
    createUpdateSubContractSupplySchedule: async (payload) => {
        try {
            const response = await apiClient.put(
                `/api/subContract/createUpdateSubContractSupplySchedule`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response;
        } catch (error) {
            console.error('Error saving sub contract supply schedule:', error);
            throw error;
        }
    },

    // Get all Sub Contract Supply Schedules by Org ID and Branch
    getSubContractSupplyScheduleByOrgIdAndBranch: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSubContractSupplyScheduleByOrgIdAndBranch?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching sub contract supply schedules:', error);
            throw error;
        }
    },

    // Get Sub Contract Supply Schedule by ID
    getSubContractSupplyScheduleById: async (id) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSubContractSupplyScheduleById?id=${id}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching sub contract supply schedule:', error);
            throw error;
        }
    },

    // Get Sub Contract Supply Schedule by Org ID (legacy)
    getSubContractSupplyScheduleByOrgId: async (orgId, branchId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSubContractSupplyScheduleByOrgId?orgId=${orgId}&branch=${branchId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching sub contract supply schedules by org:', error);
            throw error;
        }
    },

    // Get Sub Contract Supply Schedule Document ID
    getSubContractSupplyScheduleDocId: async (financialYear, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSubContractSupplyScheduleDocId?financialYear=${financialYear}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching document ID:', error);
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

    // Get Job Order No and Date for Sub Contract Supply Schedule
    getJobOrderNoAndDateForSubContractSupplySch: async (branch, contractNo, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getJobOrderNoAndDateForSubContractSupplySch?branch=${branch}&contractNo=${encodeURIComponent(contractNo)}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching job order no and date:', error);
            throw error;
        }
    },

    // Get Supplier Rate Contract Item Details for Job Order
    getSupplierRateContractItemDetailsForJobOrder: async (branch, contractNo, orgId) => {
        try {
            const response = await apiClient.get(
                `/api/subContract/getSupplierRateContractItemDetailsForJobOrder?branch=${branch}&contractNo=${encodeURIComponent(contractNo)}&orgId=${orgId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching item details:', error);
            throw error;
        }
    },
};

export default subContractSupplyScheduleAPI;