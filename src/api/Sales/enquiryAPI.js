// api/Sales/enquiryAPI.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const enquiryAPI = {
    // POST method - Create/Update Enquiry
    updateCreateEnquiry: async (formData) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/develop/updateCreateEnquiry`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error saving enquiry:', error);
            throw error;
        }
    },

    // GET method - Get Enquiries by OrgId and Branch
    getEnquiryByOrgId: async (orgId, branchId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/develop/getEnquiryByOrgId`,
                {
                    params: {
                        orgId: orgId,
                        branch: branchId,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching enquiries:', error);
            throw error;
        }
    },

    // GET method - Get Enquiry by ID for editing
    getEnquiryById: async (enquiryId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/develop/getEnquiryById`,
                {
                    params: {
                        id: enquiryId,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching enquiry:', error);
            throw error;
        }
    },

    // GET method - Download file
    downloadFile: async (filePath) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/files/download`,
                {
                    params: {
                        path: filePath,
                    },
                    responseType: 'blob',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    },
};

export default enquiryAPI;