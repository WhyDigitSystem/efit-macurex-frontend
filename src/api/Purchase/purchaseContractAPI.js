import apiClient from "../apiClient";

const BASE = "/api/purchasedeliveryschedule";

/**
 * Purchase Contract API
 *
 * IMPORTANT:
 * Backend controller expects:
 *
 * @RequestPart("purchaseContractVO") PurchaseContractDTO purchaseContractDTO
 * @RequestPart(value = "files", required = false) MultipartFile[] files
 *
 * Therefore the JSON FormData key MUST be:
 *
 *     purchaseContractVO
 *
 * NOT:
 *
 *     purchaseContractDTO
 */

const purchaseContractAPI = {
  // ===========================================================================
  // GET PURCHASE CONTRACT LIST
  // ===========================================================================
  getContractByOrgId: async (branch, orgId) => {
    const branchNum = Number(branch);
    const orgIdNum = Number(orgId);

    if (!Number.isFinite(branchNum) || !Number.isFinite(orgIdNum)) {
      const error = new Error(
        `Invalid parameters for getContractByOrgId. branch=${JSON.stringify(
          branch,
        )}, orgId=${JSON.stringify(orgId)}`,
      );

      console.error(error.message);
      throw error;
    }

    try {
      const response = await apiClient.get(
        `${BASE}/getPurchaseContractByOrgId`,
        {
          params: {
            branch: branchNum,
            orgId: orgIdNum,
          },
        },
      );

      return response?.paramObjectsMap?.purchaseContractVO || [];
    } catch (error) {
      console.error(
        "Error fetching purchase contracts:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  // ===========================================================================
  // GET PURCHASE CONTRACT BY ID
  // ===========================================================================
  getContractById: async (id) => {
    const idNum = Number(id);

    if (!Number.isFinite(idNum)) {
      const error = new Error(
        `Invalid purchase contract id: ${JSON.stringify(id)}`,
      );

      console.error(error.message);
      throw error;
    }

    try {
      const response = await apiClient.get(`${BASE}/getPurchaseContractById`, {
        params: {
          id: idNum,
        },
      });

      return response?.paramObjectsMap?.purchaseContractVO || null;
    } catch (error) {
      console.error(
        "Error fetching purchase contract:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  // ===========================================================================
  // GET PURCHASE CONTRACT DOC ID
  // ===========================================================================
  getPurchaseContractDocId: async ({ financialYear, orgId }) => {
    const orgIdNum = Number(orgId);

    if (!Number.isFinite(orgIdNum)) {
      const error = new Error(
        `Invalid orgId for getPurchaseContractDocId: ${JSON.stringify(orgId)}`,
      );

      console.error(error.message);
      throw error;
    }

    if (
      financialYear === null ||
      financialYear === undefined ||
      String(financialYear).trim() === ""
    ) {
      const error = new Error(
        `Invalid financialYear for getPurchaseContractDocId: ${JSON.stringify(
          financialYear,
        )}`,
      );

      console.error(error.message);
      throw error;
    }

    try {
      const response = await apiClient.get(`${BASE}/getPurchaseContractDocId`, {
        params: {
          financialYear: String(financialYear),
          orgId: orgIdNum,
        },
      });

      return response?.paramObjectsMap?.docId || "";
    } catch (error) {
      console.error(
        "Error generating purchase contract doc id:",
        error?.response?.data || error,
      );

      throw error;
    }
  },

  // ===========================================================================
  // SUPPLIER DROPDOWN
  // ===========================================================================
  getSupplierDropdown: async (branch, orgId) => {
    const branchNum = Number(branch);
    const orgIdNum = Number(orgId);

    if (!Number.isFinite(branchNum) || !Number.isFinite(orgIdNum)) {
      console.error("Invalid supplier dropdown parameters:", {
        branch,
        orgId,
      });

      return [];
    }

    try {
      const response = await apiClient.get(
        `${BASE}/getSupplierDropdownForPurchaseContract`,
        {
          params: {
            branch: branchNum,
            orgId: orgIdNum,
          },
        },
      );

      return response?.paramObjectsMap?.supplierList || [];
    } catch (error) {
      console.error(
        "Error fetching supplier dropdown:",
        error?.response?.data || error,
      );

      return [];
    }
  },

  // ===========================================================================
  // EMPLOYEE DROPDOWN
  // ===========================================================================
  getEmployeeDropdown: async (branch, orgId) => {
    const branchNum = Number(branch);
    const orgIdNum = Number(orgId);

    if (!Number.isFinite(branchNum) || !Number.isFinite(orgIdNum)) {
      console.error("Invalid employee dropdown parameters:", {
        branch,
        orgId,
      });

      return [];
    }

    try {
      const response = await apiClient.get(
        `${BASE}/getEmployeeDropdownPurchaseContract`,
        {
          params: {
            branch: branchNum,
            orgId: orgIdNum,
          },
        },
      );

      return response?.paramObjectsMap?.employeeList || [];
    } catch (error) {
      console.error(
        "Error fetching employee dropdown:",
        error?.response?.data || error,
      );

      return [];
    }
  },

  // ===========================================================================
  // PURCHASE CONTRACT ITEMS
  // ===========================================================================
  getContractItems: async (branch, orgId, supplier) => {
    const branchNum = Number(branch);
    const orgIdNum = Number(orgId);
    const supplierNum = Number(supplier);

    if (
      !Number.isFinite(branchNum) ||
      !Number.isFinite(orgIdNum) ||
      !Number.isFinite(supplierNum)
    ) {
      console.error("Invalid parameters for getContractItems:", {
        branch,
        orgId,
        supplier,
      });

      return [];
    }

    try {
      const response = await apiClient.get(`${BASE}/getPurchaseContractItems`, {
        params: {
          branch: branchNum,
          orgId: orgIdNum,
          supplier: supplierNum,
        },
      });

      return response?.paramObjectsMap?.itemList || [];
    } catch (error) {
      console.error(
        "Error fetching purchase contract items:",
        error?.response?.data || error,
      );

      return [];
    }
  },

  // ===========================================================================
  // CREATE / UPDATE PURCHASE CONTRACT
  // ===========================================================================
  createUpdateContract: async (payload, files = []) => {
    try {
      if (!payload || typeof payload !== "object") {
        throw new Error(
          "Purchase contract payload is required and must be an object.",
        );
      }

      const formData = new FormData();

      // -----------------------------------------------------------------------
      // Backend expects:
      //
      // @RequestPart("purchaseContractVO")
      // PurchaseContractDTO purchaseContractDTO
      //
      // Therefore DO NOT change this key to purchaseContractDTO.
      // -----------------------------------------------------------------------
      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });

      formData.append("purchaseContractVO", jsonBlob);

      // -----------------------------------------------------------------------
      // Attach only real files.
      //
      // DO NOT send a fake empty Blob.
      // Backend has required=false for files.
      // -----------------------------------------------------------------------
      if (Array.isArray(files) && files.length > 0) {
        files
          .filter((file) => file instanceof File || file instanceof Blob)
          .forEach((file) => {
            formData.append("files", file);
          });
      }

      // -----------------------------------------------------------------------
      // DEBUG
      // -----------------------------------------------------------------------
      console.log(
        "============================================================",
      );
      console.log("PURCHASE CONTRACT REQUEST");
      console.log(
        "============================================================",
      );

      console.log("URL:", `${BASE}/updateCreatePurchaseContract`);
      console.log("Payload:", payload);
      console.log("Files:", files);

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`FormData -> ${key}:`, {
            name: value.name,
            type: value.type,
            size: value.size,
          });
        } else if (value instanceof Blob) {
          console.log(`FormData -> ${key}:`, {
            type: value.type,
            size: value.size,
          });
        } else {
          console.log(`FormData -> ${key}:`, value);
        }
      }

      console.log(
        "============================================================",
      );

      // -----------------------------------------------------------------------
      // IMPORTANT:
      // Do NOT manually set Content-Type.
      //
      // Axios/browser automatically creates:
      //
      // multipart/form-data; boundary=...
      //
      // The boundary is required by Spring Multipart handling.
      // -----------------------------------------------------------------------
      const response = await apiClient.post(
        `${BASE}/updateCreatePurchaseContract`,
        formData,
      );

      // -----------------------------------------------------------------------
      // Your backend returns HTTP 200 even when service throws an exception.
      // Therefore inspect the actual application response as well.
      // -----------------------------------------------------------------------
      console.log(
        "============================================================",
      );
      console.log("PURCHASE CONTRACT RESPONSE");
      console.log(
        "============================================================",
      );
      console.log("Response:", response);
      console.log(
        "============================================================",
      );

      // -----------------------------------------------------------------------
      // Axios response interceptor may already return response.data.
      // Handle both possible structures:
      //
      // response.paramObjectsMap
      //
      // OR
      //
      // response.data.paramObjectsMap
      // -----------------------------------------------------------------------
      const responseData =
        response?.data &&
        typeof response.data === "object" &&
        (response.data.paramObjectsMap !== undefined ||
          response.data.status !== undefined ||
          response.data.statusFlag !== undefined)
          ? response.data
          : response;

      // -----------------------------------------------------------------------
      // Backend createServiceResponseError(...) can still return HTTP 200.
      // Detect application-level failure.
      // -----------------------------------------------------------------------
      const statusFlag = responseData?.statusFlag;
      const status = responseData?.status;

      const isApplicationError =
        statusFlag === "Error" || statusFlag === "ERROR" || status === false;

      if (isApplicationError) {
        const errorMessage =
          responseData?.message ||
          responseData?.errorMessage ||
          responseData?.error ||
          responseData?.paramObjectsMap?.message ||
          "Purchase Contract could not be saved.";

        const applicationError = new Error(errorMessage);

        applicationError.response = {
          data: responseData,
          status: 200,
        };

        console.error("PURCHASE CONTRACT APPLICATION ERROR:", responseData);

        throw applicationError;
      }

      return responseData;
    } catch (error) {
      // -----------------------------------------------------------------------
      // Detailed error logging
      // -----------------------------------------------------------------------
      console.error(
        "============================================================",
      );
      console.error("PURCHASE CONTRACT API ERROR");
      console.error(
        "============================================================",
      );

      console.error("Message:", error?.message);
      console.error("Status:", error?.response?.status);
      console.error("Response:", error?.response?.data);
      console.error("Headers:", error?.response?.headers);
      console.error("Request URL:", error?.config?.url);
      console.error("Request Method:", error?.config?.method);

      console.error(
        "============================================================",
      );

      throw error;
    }
  },
};

export default purchaseContractAPI;
