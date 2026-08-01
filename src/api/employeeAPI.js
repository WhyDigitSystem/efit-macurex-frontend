import apiClient from "./apiClient";

export const employeeAPI = {
  // Get Employee By ID
  getEmployeeById: async (id) => {
    try {
      const res = await apiClient.get(
        `/api/efitmaster/getEmployeeMasterById?id=${id}`,
      );
      return res?.paramObjectsMap?.employeeMasterVO || null;
    } catch (error) {
      console.error("Error fetching employee by ID:", error);
      throw error;
    }
  },

  // Get Employee List By Organization
  getEmployeeByOrgId: async (orgId) => {
    try {
      const res = await apiClient.get(
        `/api/efitmaster/getEmployeeMasterByOrgId?orgId=${orgId}`,
      );
      return res?.paramObjectsMap?.employeeMasterVO || [];
    } catch (error) {
      console.error("Error fetching employee list:", error);
      throw error;
    }
  },

  // Create / Update Employee
  updateCreateEmployee: async (employeeMasterDTO) => {
    try {
      const res = await apiClient.put(
        "/api/efitmaster/updateCreateEmployeeMaster",
        employeeMasterDTO,
      );
      return res;
    } catch (error) {
      console.error("Error creating/updating employee:", error);
      throw error;
    }
  },
};

export default employeeAPI;
