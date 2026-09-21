// subContractingGrnAPI.js
import apiClient from "../apiClient";

const subContractingGrnAPI = {
  /* ==========================================================================
     CRUD — Sub Contracting GRN record itself
  ========================================================================== */

  // Response: paramObjectsMap.subContractingGRN[]
  getGrnByOrgId: async (orgId, branch) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getSubContractingGRNByOrgIdAndBranch",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.subContractingGRN || [];
    } catch (error) {
      console.error("Error fetching sub contracting GRNs:", error);
      throw error;
    }
  },

  // Response: paramObjectsMap.subContractingGRN (single object, or an array
  // with one item — both are handled)
  getGrnById: async (id) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getSubContractingGRNById",
        { params: { id } },
      );
      const rec = res?.paramObjectsMap?.subContractingGRN;
      return Array.isArray(rec) ? rec[0] || null : rec || null;
    } catch (error) {
      console.error("Error fetching sub contracting GRN by id:", error);
      throw error;
    }
  },

  // Body must match the backend DTO exactly — see the Model in Swagger for
  // createUpdateSubContractingGRN: { active, basicAmount, belongsTo, branch,
  // cancelRemarks, contractNo, createdBy, department, details[], financialYear,
  // gatePassNo, grnClearTime, gstState, gstType, gstnNo, id, isIGSTAppl, orgId,
  // remarks, revsChrg, rework, sacCode, schEndDate, schStartDate, scheduleNo,
  // serviceName, supplierDcDate, supplierDcNo, taxDetails[], taxPercentage,
  // taxType, totalAmount, totalTax, vendor, vendorLocation }
  createUpdateGrn: async (payload) => {
    try {
      const res = await apiClient.put(
        "/api/subContract/createUpdateSubContractingGRN",
        payload,
      );
      return res;
    } catch (error) {
      console.error("Error saving sub contracting GRN:", error);
      throw error;
    }
  },

  // Auto-generated S.C GRN No for a new record.
  // Response: paramObjectsMap.subContractingGRNDocId
  getGrnDocId: async (financialYear, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getSubContractingGRNDocId",
        { params: { financialYear, orgId } },
      );
      return res?.paramObjectsMap?.subContractingGRNDocId || "";
    } catch (error) {
      console.error("Error fetching sub contracting GRN doc id:", error);
      throw error;
    }
  },

  /* ==========================================================================
     Vendor lookup — Vendor Id (customerCode), Vendor Name (customerName),
     GST State (gstState), GSTN No (gstNo), GST Type (gstType), and
     IsIGSTAppl (igstApplicable). NOTE: "address" is a free-text string here,
     but the DTO's vendorLocation wants a numeric location-master id — see
     loadLocations in the form. Vendor's address is only used as a best-effort
     hint, not the submitted value.
  ========================================================================== */

  // Response: paramObjectsMap.customerList[]
  getCustomerForSupplierRateContract: async (branch, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getCustomerForSupplierRateContract",
        { params: { branch, orgId } },
      );
      return res?.paramObjectsMap?.customerList || [];
    } catch (error) {
      console.error("Error fetching supplier rate contract customers:", error);
      throw error;
    }
  },

  /* ==========================================================================
     Gate Pass lookup — Gate Pass No, Supplier DC No, Supplier DC Date
     Scoped to the selected vendor.
  ========================================================================== */

  // Response: paramObjectsMap.GateInwardEntryVO[]
  //   { GatePassNo, GatePassDate, supplierDCNumber, supplierDcDate }
  getGateInwardEntry: async (branch, customer, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getGateInwardEntryforSubContractingGRN",
        { params: { branch, customer, orgId } },
      );
      return res?.paramObjectsMap?.GateInwardEntryVO || [];
    } catch (error) {
      console.error("Error fetching gate inward entries:", error);
      throw error;
    }
  },

  /* ==========================================================================
     Supply Schedule lookup — Schedule No, Contract No, Sch Start/End Date,
     Service Name, SAC Code, Tax %. Scoped to the selected vendor.
  ========================================================================== */

  // Response: paramObjectsMap.SubcontractSupplyScheduleVO[]
  //   { scheduleNo, contractNo, schStartDate, schEndDate, serviceId,
  //     serviceName, hsnId, hsnCode, hsnDescription, gstRate, cgstRate,
  //     sgstRate, igstRate }
  getSubcontractSupplySchedule: async (branch, customer, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getSubcontractSupplyScheduleforSubContractingGRN",
        { params: { branch, customer, orgId } },
      );
      return res?.paramObjectsMap?.SubcontractSupplyScheduleVO || [];
    } catch (error) {
      console.error("Error fetching subcontract supply schedule:", error);
      throw error;
    }
  },

  /* ==========================================================================
     Item lookup — Incoming Item Code/Desc, Primary Unit, Job Order No/Qty/Rate
     Scoped to the selected vendor + schedule no.
  ========================================================================== */

  // Response: paramObjectsMap.SubcontractSupplyScheduleItemVO[]
  //   { itemId, itemCode, itemDescription, unitId, unitCode, unitDescription,
  //     jobOrderNo, jobOrderQty, jobOrderRate }
  getItemDetailsForGrn: async (branch, customer, orgId, scheduleNo) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getItemDetailsForSubContractingGRN",
        { params: { branch, customer, orgId, scheduleNo } },
      );
      return res?.paramObjectsMap?.SubcontractSupplyScheduleItemVO || [];
    } catch (error) {
      console.error("Error fetching item details for GRN:", error);
      throw error;
    }
  },

  /* ==========================================================================
     BOM lookup — feeds the Consumption/Scrap sub-table nested under each
     GRN Detail row. Scoped to the selected incoming item.
  ========================================================================== */

  // Response: paramObjectsMap.BomItemDetailsVO[]
  //   { itemId, bomId, itemCode, itemDescription, unitId, unitCode,
  //     unitDescription, bomQty, scrapQty, scrapItem }
  // NOTE: the sample response has no "itemType", "availableStock" or "rate" —
  // those stay manual-entry fields in the form.
  getBomItemDetails: async (branch, itemId, orgId) => {
    try {
      const res = await apiClient.get(
        "/api/subContract/getBomItemDetailsforSubContractingGRN",
        { params: { branch, itemId, orgId } },
      );
      return res?.paramObjectsMap?.BomItemDetailsVO || [];
    } catch (error) {
      console.error("Error fetching BOM item details:", error);
      throw error;
    }
  },
};

export default subContractingGrnAPI;
export { subContractingGrnAPI };
