import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import purchaseContractAPI from "../../../api/Purchase/purchaseContractAPI";
import { toast } from "../../../utils/toast";
import generatePurchaseContractPDF from "../../../utils/generatePurchaseContractPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

/*
 * ============================================================================
 * PURCHASE CONTRACT LIST
 * ============================================================================
 *
 * IMPORTANT:
 *
 * Backend response structure is:
 *
 * paramObjectsMap: {
 *   purchaseContractVO: [
 *     {
 *       id: 1000000015,
 *       branch: {
 *         id: 15183000000001,
 *         branchCode: "BLR",
 *         branchName: "BANGALORE"
 *       },
 *       department: {
 *         id: 1000000001,
 *         departmentCode: "PUR",
 *         departmentName: "PURCHASE"
 *       },
 *       supplier: {
 *         id: 1000000001,
 *         customerName: "Vignesh PVT LTD",
 *         customerCode: "SUP1001"
 *       },
 *       gstState: {
 *         id: 15607000000248,
 *         stateCode: "KA",
 *         stateName: "Karnataka"
 *       },
 *       validFrom: "2026-09-09",
 *       validTo: "2026-09-09",
 *       purchaseOrderType: "Local",
 *       ...
 *     }
 *   ]
 * }
 *
 * The table should therefore use the actual backend field names after
 * normalizing them.
 */

/*
 * ============================================================================
 * GET ORGANIZATION ID
 * ============================================================================
 */
const getOrgId = () => {
  /*
   * First try direct orgId.
   */
  const directOrgId = localStorage.getItem("orgId");

  if (directOrgId) {
    return directOrgId;
  }

  /*
   * Fallback to userData.
   */
  const userData = localStorage.getItem("userData");

  if (!userData) {
    return "";
  }

  try {
    const parsedUserData = JSON.parse(userData);

    if (parsedUserData?.orgId !== null && parsedUserData?.orgId !== undefined) {
      return String(parsedUserData.orgId);
    }
  } catch (error) {
    console.error("Failed to parse userData from localStorage:", error);
  }

  return "";
};

/*
 * ============================================================================
 * GET BRANCH ID
 * ============================================================================
 */
const getBranchId = () => {
  const branchId = localStorage.getItem("branchId");

  if (branchId) {
    return branchId;
  }

  return "";
};

/*
 * ============================================================================
 * SAFE VALUE
 * ============================================================================
 *
 * Converts any backend value into something React can safely display.
 *
 * Examples:
 *
 * { id: 1, branchName: "Bangalore" }
 *       ->
 * "Bangalore"
 *
 * null
 *       ->
 * ""
 *
 * "Local"
 *       ->
 * "Local"
 */
const getDisplayValue = (value, nameKeys = [], codeKeys = []) => {
  if (value === null || value === undefined) {
    return "";
  }

  /*
   * Primitive values.
   */
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  /*
   * Object values.
   */
  if (typeof value === "object") {
    /*
     * First try name fields.
     */
    for (const key of nameKeys) {
      if (
        value[key] !== null &&
        value[key] !== undefined &&
        value[key] !== ""
      ) {
        return String(value[key]);
      }
    }

    /*
     * Then try code fields.
     */
    for (const key of codeKeys) {
      if (
        value[key] !== null &&
        value[key] !== undefined &&
        value[key] !== ""
      ) {
        return String(value[key]);
      }
    }

    /*
     * Finally use ID.
     */
    if (value.id !== null && value.id !== undefined) {
      return String(value.id);
    }
  }

  return "";
};

/*
 * ============================================================================
 * FORMAT DATE
 * ============================================================================
 */
const formatDate = (value) => {
  if (!value) {
    return "";
  }

  /*
   * Backend currently returns:
   *
   * 2026-09-09
   *
   * We keep it as YYYY-MM-DD because it is safe and predictable.
   */
  return String(value);
};

/*
 * ============================================================================
 * NORMALIZE PURCHASE CONTRACT
 * ============================================================================
 *
 * This is the most important part.
 *
 * Backend:
 *
 * branch.branchName
 * department.departmentName
 * supplier.customerName
 * supplier.customerCode
 * purchaseOrderType
 *
 * are converted into flat table fields:
 *
 * plantId
 * department
 * supplierName
 * supplierCode
 * poType
 */
const normalizeContract = (contract) => {
  if (!contract || typeof contract !== "object") {
    return {};
  }

  /*
   * Extract nested objects.
   */
  const branch = contract?.branch || {};
  const department = contract?.department || {};
  const supplier = contract?.supplier || {};
  const gstState = contract?.gstState || {};

  /*
   * Extract first item.
   *
   * This is useful for PDF/details and also gives us safe access
   * to item information.
   */
  const firstDetail =
    Array.isArray(contract?.details) && contract.details.length > 0
      ? contract.details[0]
      : null;

  /*
   * Return original object + normalized display fields.
   */
  return {
    ...contract,

    /*
     * ========================================================================
     * ID
     * ========================================================================
     */
    id: contract?.id ?? "",

    /*
     * ========================================================================
     * CONTRACT NUMBER
     * ========================================================================
     *
     * Your current backend response does NOT contain a field called
     * contractNo.
     *
     * Therefore use id as a temporary display fallback.
     *
     * If your backend later adds:
     *
     * contractNo: "PC/2026/0001"
     *
     * this automatically uses it.
     */
    contractNo:
      contract?.contractNo ||
      contract?.purchaseContractNo ||
      contract?.documentNo ||
      contract?.docId ||
      String(contract?.id || ""),

    /*
     * ========================================================================
     * DATE
     * ========================================================================
     *
     * There is no "date" in your response.
     *
     * validFrom is therefore used as the display date.
     */
    date: formatDate(
      contract?.date ||
        contract?.contractDate ||
        contract?.documentDate ||
        contract?.validFrom,
    ),

    /*
     * ========================================================================
     * PLANT / BRANCH
     * ========================================================================
     *
     * Backend:
     *
     * branch: {
     *   branchCode: "BLR",
     *   branchName: "BANGALORE"
     * }
     *
     * Display:
     *
     * BANGALORE (BLR)
     */
    plantId: branch?.branchName
      ? branch?.branchCode
        ? `${branch.branchName} (${branch.branchCode})`
        : String(branch.branchName)
      : getDisplayValue(
          contract?.plantId,
          ["plantName", "branchName", "name"],
          ["plantCode", "branchCode", "code"],
        ),

    /*
     * Keep original branch ID separately.
     */
    branchId: branch?.id ?? contract?.branchId ?? "",

    /*
     * ========================================================================
     * BELONGS TO
     * ========================================================================
     */
    belongsTo: getDisplayValue(
      contract?.belongsTo,
      ["name", "value", "description"],
      ["code", "key"],
    ),

    /*
     * ========================================================================
     * DEPARTMENT
     * ========================================================================
     *
     * Backend returns:
     *
     * department: {
     *   departmentCode: "PUR",
     *   departmentName: "PURCHASE"
     * }
     */
    department:
      department?.departmentName ||
      department?.departmentCode ||
      getDisplayValue(
        contract?.department,
        ["departmentName", "name"],
        ["departmentCode", "code"],
      ),

    /*
     * Department code separately.
     */
    departmentCode: department?.departmentCode || "",

    /*
     * ========================================================================
     * SUPPLIER CODE
     * ========================================================================
     *
     * Backend:
     *
     * supplier.customerCode
     */
    supplierCode:
      supplier?.customerCode ||
      supplier?.supplierCode ||
      supplier?.vendorCode ||
      "",

    /*
     * ========================================================================
     * SUPPLIER NAME
     * ========================================================================
     *
     * Backend:
     *
     * supplier.customerName
     */
    supplierName:
      supplier?.customerName ||
      supplier?.supplierName ||
      supplier?.vendorName ||
      "",

    /*
     * Supplier ID.
     */
    supplierId: supplier?.id ?? contract?.supplierId ?? "",

    /*
     * ========================================================================
     * GST STATE
     * ========================================================================
     */
    gstState: gstState?.stateName || gstState?.stateCode || "",

    /*
     * ========================================================================
     * PURCHASE ORDER TYPE
     * ========================================================================
     *
     * Backend field:
     *
     * purchaseOrderType
     *
     * Frontend table field:
     *
     * poType
     */
    poType: contract?.purchaseOrderType || contract?.poType || "",

    /*
     * ========================================================================
     * VALID DATES
     * ========================================================================
     */
    validFrom: formatDate(contract?.validFrom),

    validTo: formatDate(contract?.validTo),

    /*
     * ========================================================================
     * STATUS
     * ========================================================================
     *
     * Backend:
     *
     * active: "Active"
     *
     * Keep it as Active / Inactive.
     */
    active:
      contract?.active === true
        ? "Active"
        : contract?.active === false
          ? "Inactive"
          : contract?.active || "",

    /*
     * ========================================================================
     * IGST
     * ========================================================================
     */
    isIgstAppl: contract?.igstAppl ?? contract?.IGSTAppl ?? false,

    /*
     * ========================================================================
     * FIRST ITEM
     * ========================================================================
     */
    itemCode:
      firstDetail?.itemCode?.itemCode || firstDetail?.itemCode?.id || "",

    itemDescription: firstDetail?.itemCode?.itemDescription || "",

    hsnCode: firstDetail?.hsnCode || "",

    unit: firstDetail?.unit?.unitDescription || firstDetail?.unit?.unitId || "",

    /*
     * Keep details exactly as returned from backend.
     */
    details: Array.isArray(contract?.details) ? contract.details : [],

    /*
     * Keep tax details exactly as returned from backend.
     */
    taxDetails: Array.isArray(contract?.taxDetails) ? contract.taxDetails : [],

    /*
     * Keep attachments.
     */
    attachments: Array.isArray(contract?.attachments)
      ? contract.attachments
      : [],
  };
};

/*
 * ============================================================================
 * PURCHASE CONTRACT LIST COMPONENT
 * ============================================================================
 */
const PurchaseContractList = ({ onAddNew, onEdit, refreshTrigger, onBack }) => {
  const [contractData, setContractData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);

  /*
   * ==========================================================================
   * LOAD CONTRACTS
   * ==========================================================================
   */
  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);

      const branch = getBranchId();
      const orgId = getOrgId();

      console.log(
        "============================================================",
      );
      console.log("PURCHASE CONTRACT LIST");
      console.log(
        "============================================================",
      );
      console.log("Branch ID:", branch);
      console.log("Organization ID:", orgId);

      /*
       * Validate branch.
       */
      if (!branch) {
        setContractData([]);
        toast.error("Branch ID not found. Please login again.");
        return;
      }

      /*
       * Validate organization.
       */
      if (!orgId) {
        setContractData([]);
        toast.error("Organization ID not found. Please login again.");
        return;
      }

      /*
       * Call backend.
       */
      const contracts = await purchaseContractAPI.getContractByOrgId(
        branch,
        orgId,
      );

      console.log("Raw Purchase Contract API Result:", contracts);

      /*
       * Make sure we have an array.
       */
      const contractList = Array.isArray(contracts) ? [...contracts] : [];

      console.log("Purchase Contract Count:", contractList.length);

      /*
       * Normalize response.
       */
      const normalizedContracts = contractList.map(normalizeContract);

      /*
       * Sort newest ID first.
       */
      normalizedContracts.sort(
        (a, b) => (Number(b?.id) || 0) - (Number(a?.id) || 0),
      );

      console.log("Normalized Purchase Contracts:", normalizedContracts);

      /*
       * Set data.
       */
      setContractData(normalizedContracts);
    } catch (error) {
      console.error("Failed to load purchase contracts:", error);

      setContractData([]);

      toast.error(error?.message || "Failed to fetch Purchase Contracts");
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * ==========================================================================
   * INITIAL LOAD + REFRESH
   * ==========================================================================
   */
  useEffect(() => {
    loadContracts();
  }, [loadContracts, refreshTrigger]);

  /*
   * ==========================================================================
   * PDF DOWNLOAD / PREVIEW
   * ==========================================================================
   */
  const handleDownloadPDF = (row) => {
    try {
      /*
       * Backend directly provides:
       *
       * details
       * taxDetails
       * and the main contract fields.
       */
      const itemSource = Array.isArray(row?.details) ? row.details : [];

      const taxSource = Array.isArray(row?.taxDetails) ? row.taxDetails : [];

      /*
       * Convert item details to PDF format.
       */
      const items = itemSource.map((item) => ({
        itemCode:
          item?.itemCode?.itemCode ||
          item?.itemCode?.id ||
          item?.itemCode ||
          "",

        itemDescription:
          item?.itemCode?.itemDescription || item?.itemDescription || "",

        hsnSacCode: item?.hsnCode || item?.hsnSacCode || "",

        taxType: item?.taxType || "",

        taxPercent: item?.taxPercentage || item?.taxPercent || 0,

        unit:
          item?.unit?.unitDescription || item?.unit?.unitId || item?.unit || "",

        rate: item?.rateInCurrency || item?.rate || 0,

        inCurrency: item?.rateInCurrency || item?.inCurrency || 0,

        sgstRate: item?.sgstRate || 0,

        sgstAmount: item?.sgstAmount || 0,

        cgstRate: item?.cgstRate || 0,

        cgstAmount: item?.cgstAmount || 0,

        igstRate: item?.igstRate || 0,

        igstAmount: item?.igstAmount || 0,

        validFrom: item?.validFrom || "",

        validTo: item?.validTo || "",
      }));

      /*
       * Convert tax details.
       */
      const taxDetails = taxSource.map((tax) => ({
        particular: tax?.particulars || tax?.particular || "",

        taxPercent: tax?.taxPercent || 0,

        amount: tax?.amount || 0,
      }));

      /*
       * Generate PDF.
       */
      const result = generatePurchaseContractPDF({
        company: {
          name: row?.plantId || "Company Name",
        },

        contract: {
          plantId: row?.plantId || "",

          belongsTo: row?.belongsTo || "",

          /*
           * Use backend ID if actual contract number
           * is not present.
           */
          contractNo: row?.contractNo || String(row?.id || ""),

          department: row?.department || "",

          date: row?.date || row?.validFrom || "",

          supplierCode: row?.supplierCode || "",

          supplierName: row?.supplierName || "",

          supplierRefNo: row?.supplierRefNo || "",

          refDate: row?.refDate || "",

          gstState: row?.gstState || "",

          validFrom: row?.validFrom || "",

          validTo: row?.validTo || "",

          isIgstAppl: row?.isIgstAppl ? "Yes" : "No",

          poType: row?.poType || "",

          gstnNo: row?.gstnNo || "",

          currency: row?.currency || "",

          taxDescription: row?.taxDescription || "",
        },

        items,

        taxDetails,

        chargesSummary: {
          modeOfDespatch: row?.modeOfDespatch || "",

          paymentTerms: row?.paymentTerms || "",

          delivery: row?.delivery || "",

          freightType: row?.freightType || "",

          packingType: row?.packingType || "",

          insuranceAmount: row?.insuranceAmount || 0,

          bankAccounts: row?.bank || row?.bankAccounts || "",

          swiftCode: row?.swiftCode || "",

          checkedBy: row?.checkedBy || "",

          preparedBy: row?.preparedBy || "",

          authorisedBy: row?.authorisedBy || "",

          freightForwarder: row?.freightForwarder || "",

          notes: row?.notes || "",

          termsConditions: row?.termsConditions || "",
        },
      });

      /*
       * Show PDF preview.
       */
      if (result?.blobUrl) {
        setPdfPreview(result);
      } else {
        toast.error("Failed to generate PDF preview");
      }
    } catch (error) {
      console.error("PDF generation failed:", error);

      toast.error(
        `Failed to generate PDF: ${error?.message || "Unknown error"}`,
      );
    }
  };

  /*
   * ==========================================================================
   * TABLE COLUMNS
   * ==========================================================================
   *
   * These now match the normalized data above.
   */
  const columns = [
    {
      key: "contractNo",
      label: "Contract No",
      accessor: "contractNo",
      type: "text",
    },

    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
    },

    {
      key: "plantId",
      label: "Plant",
      accessor: "plantId",
      type: "text",
    },

    // {
    //   key: "belongsTo",
    //   label: "Belongs To",
    //   accessor: "belongsTo",
    //   type: "text",
    // },

    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },

    {
      key: "supplierCode",
      label: "Supplier Code",
      accessor: "supplierCode",
      type: "text",
    },

    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: "supplierName",
      type: "text",
    },

    {
      key: "poType",
      label: "P.O Type",
      accessor: "poType",
      type: "text",
    },

    {
      key: "validFrom",
      label: "Valid From",
      accessor: "validFrom",
      type: "text",
    },

    {
      key: "validTo",
      label: "Valid To",
      accessor: "validTo",
      type: "text",
    },

    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",

      statusVariants: {
        Active: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },

        Inactive: {
          label: "Inactive",
          className:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        },
      },
    },

    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  /*
   * ==========================================================================
   * SEARCH FIELDS
   * ==========================================================================
   */
  const searchFields = [
    "contractNo",
    "date",
    "plantId",
    "belongsTo",
    "department",
    "supplierCode",
    "supplierName",
    "poType",
    "validFrom",
    "validTo",
    "active",
  ];

  /*
   * ==========================================================================
   * FILTER OPTIONS
   * ==========================================================================
   */
  const filterOptions = [
    {
      value: "all",
      label: "All",
      field: null,
    },

    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: "active",
      activeValue: "Active",
    },

    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "inactive",
      activeValue: "Inactive",
    },
  ];

  /*
   * ==========================================================================
   * RENDER
   * ==========================================================================
   */
  return (
    <>
      <CommonListViewTable
        title="Purchase Contract (Open)"
        data={contractData}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        filterOptions={filterOptions}
        defaultFilter="all"
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={onEdit}
        onDownload={handleDownloadPDF}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage="No Purchase Contracts found"
        loadingMessage="Loading Purchase Contracts..."
        enableRefresh={true}
        onRefresh={loadContracts}
        enableExport={true}
        exportFileName="PurchaseContracts"
      />

      {pdfPreview && (
        <PDFPreviewModal
          blobUrl={pdfPreview.blobUrl}
          fileName={pdfPreview.fileName}
          onClose={() => {
            if (pdfPreview.blobUrl) {
              URL.revokeObjectURL(pdfPreview.blobUrl);
            }

            setPdfPreview(null);
          }}
        />
      )}
    </>
  );
};

export default PurchaseContractList;
