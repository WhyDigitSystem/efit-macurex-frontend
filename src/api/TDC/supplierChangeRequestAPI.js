import apiClient from "../apiClient";

/* Supplier Change Request (SCR) API */
const supplierChangeRequestAPI = {
  /* ---------------- List by Org + Branch ---------------- */
  getByOrgIdAndBranch: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getSupplierChangeRequestByOrgId?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.supplierChangeRequestVO || [];
    } catch (error) {
      console.error("Error fetching supplier change requests:", error);
      throw error;
    }
  },

  // Back-compat alias — older callers use this signature.
  getScrByOrgId: async (orgId, branch) => {
    return supplierChangeRequestAPI.getByOrgIdAndBranch({ branch, orgId });
  },

  /* ---------------- Get by Id ---------------- */
  getById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getSupplierChangeRequestById?id=${id}`,
      );
      return res?.paramObjectsMap?.supplierChangeRequestVO || null;
    } catch (error) {
      console.error("Error fetching supplier change request by id:", error);
      throw error;
    }
  },

  /* ---------------- Doc Id ---------------- */
  getDocId: async ({ financialYear, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getSupplierChangeRequestDocId?financialYear=${financialYear}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error("Error fetching SCR DocId:", error);
      throw error;
    }
  },

  /* ---------------- Vendor Code dropdown ---------------- */
  getVendorCodeDropdown: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getVendorCodeDropdownForSupplierChangeRequest?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.vendorCode || [];
    } catch (error) {
      console.error("Error fetching vendor code dropdown:", error);
      throw error;
    }
  },

  /* ---------------- Buyer Name (Purchase Employees) dropdown ---------------- */
  getPurchaseEmployeesDropdown: async ({ branch, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/vendorComplaintEntry/getPurchaseEmployeesDropdownForSupplierChangeRequest?branch=${branch}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.purchaseEmployees || [];
    } catch (error) {
      console.error("Error fetching purchase employees dropdown:", error);
      throw error;
    }
  },

  /* ---------------- All employees (for Source/Process Triggered By) ---------------- */
  getAllEmployees: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/efitmaster/getEmployeeMasterByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.employeeMasterVO || [];
    } catch (error) {
      console.error("Error fetching all employees:", error);
      throw error;
    }
  },

  /* ---------------- Employees by department (for Sign-by fields) ---------------- */
  getEmployeesByDepartment: async ({ branch, department, orgId }) => {
    try {
      const res = await apiClient.get(
        `/api/subContract/getEmployeesByDepartmentforBOMCorrectionRequestNote?branch=${branch}&department=${encodeURIComponent(
          department,
        )}&orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.employeeList || [];
    } catch (error) {
      console.error(
        `Error fetching employees for department ${department}:`,
        error,
      );
      throw error;
    }
  },

  /* ---------------- Save ---------------- */
  createUpdateScr: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/vendorComplaintEntry/updateCreateSupplierChangeRequest",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving supplier change request:", error);
      throw error;
    }
  },
};

export default supplierChangeRequestAPI;