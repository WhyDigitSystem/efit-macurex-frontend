// src/api/quality/flashNcReportAPI.js

import api from "../apiClient"; // ← adjust to your axios instance path

const BASE = "/api/vendorComplaintEntry";

const flashNcReportAPI = {
    /* =====================================================
       GET FLASH NC REPORT DOC ID (FR NO)
       GET /api/vendorComplaintEntry/getFlashNCReportDocId
       Params: financialYear, orgId
    ===================================================== */
    getFlashNCReportDocId: async ({ financialYear, orgId }) => {
        const response = await api.get(`${BASE}/getFlashNCReportDocId`, {
            params: { financialYear, orgId },
        });
        return response;
    },

    /* =====================================================
       GET MRIN / GRN DROPDOWN
       GET /api/vendorComplaintEntry/getMRINGRNDropdownForFlashNCReport
       Params: branch, orgId
    ===================================================== */
    getMRINGRNDropdownForFlashNCReport: async ({ branch, orgId }) => {
        const response = await api.get(
            `${BASE}/getMRINGRNDropdownForFlashNCReport`,
            {
                params: { branch, orgId },
            },
        );
        return response;
    },

    /* =====================================================
       GET QUALITY EMPLOYEES (INSPECTED BY)
       GET /api/vendorComplaintEntry/getQualityEmployeesForFlashNCReport
       Params: branch, orgId
    ===================================================== */
    getQualityEmployeesForFlashNCReport: async ({ branch, orgId }) => {
        const response = await api.get(
            `${BASE}/getQualityEmployeesForFlashNCReport`,
            {
                params: { branch, orgId },
            },
        );
        return response;
    },

    /* =====================================================
       GET FROM DEPARTMENT DROPDOWN   ★ NEW
       GET /api/vendorComplaintEntry/getFromDeptDropdownForFlashNCReport
       Params: branch, orgId
       Response: { paramObjectsMap: { fromDepartment: [{ id, name }] } }
    ===================================================== */
    getFromDeptDropdownForFlashNCReport: async ({ branch, orgId }) => {
        const response = await api.get(
            `${BASE}/getFromDeptDropdownForFlashNCReport`,
            {
                params: { branch, orgId },
            },
        );
        return response;
    },

    /* =====================================================
       GET BY ID
       GET /api/vendorComplaintEntry/getFlashNCReportById
    ===================================================== */
    getById: async (id) => {
        const response = await api.get(`${BASE}/getFlashNCReportById`, {
            params: { id },
        });
        return response;
    },

    /* =====================================================
       GET ALL BY ORG / BRANCH
    ===================================================== */
    getByOrgId: async (orgId, branch) => {
        const response = await api.get(`${BASE}/getFlashNCReportByOrgId`, {
            params: { orgId, branch },
        });
        return response;
    },

    /* =====================================================
       CREATE / UPDATE (MULTIPART)
       POST /api/vendorComplaintEntry/updateCreateFlashNCReport
    ===================================================== */
    save: async (formData) => {
        const response = await api.post(
            `${BASE}/updateCreateFlashNCReport`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        return response;
    },
};

export default flashNcReportAPI;