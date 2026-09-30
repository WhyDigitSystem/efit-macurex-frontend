import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import purchaseIndentAPI from "../../../api/Purchase/purchaseIndentAPI";
import { toast } from "../../../utils/toast";
import generatePurchaseIndentPDF from "../../../utils/generatePurchaseIndentPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const PurchaseIndentList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);

  // ============================================================
  // Convert API values safely to displayable strings
  // ============================================================
  const getDisplayValue = (value, fields = []) => {
    if (value === null || value === undefined) {
      return "";
    }

    // String / number / boolean
    if (typeof value !== "object") {
      return String(value);
    }

    // Nested object
    for (const field of fields) {
      if (
        value[field] !== null &&
        value[field] !== undefined &&
        value[field] !== ""
      ) {
        return String(value[field]);
      }
    }

    return "";
  };

  // ============================================================
  // Load Purchase Indents
  // ============================================================
  const loadItems = async () => {
    setLoading(true);

    try {
      const orgId = localStorage.getItem("orgId");
      const branchId = localStorage.getItem("branchId");

      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");

        toast.error("Organization or Branch information is missing");

        setItemData([]);
        return;
      }

      const response = await purchaseIndentAPI.getPurchaseIndentByOrgId(
        orgId,
        branchId,
      );

      // ============================================================
      // Extract list from API response
      // ============================================================
      let indents = [];

      const responseData = response?.paramObjectsMap?.purchaseIndentResponseVO;

      if (Array.isArray(responseData)) {
        indents = responseData;
      } else if (Array.isArray(responseData?.content)) {
        indents = responseData.content;
      } else if (Array.isArray(response?.content)) {
        indents = response.content;
      } else if (Array.isArray(response)) {
        indents = response;
      } else if (responseData && typeof responseData === "object") {
        indents = [responseData];
      }

      // ============================================================
      // Transform API data
      // IMPORTANT:
      // Never allow nested objects to reach CommonListViewTable
      // ============================================================
      const transformedData = indents.map((indent) => {
        const branchName = getDisplayValue(indent.branch, [
          "branchName",
          "name",
          "branchCode",
        ]);

        const departmentName = getDisplayValue(indent.department, [
          "departmentName",
          "name",
          "departmentCode",
        ]);

        const preparedByName = getDisplayValue(indent.preparedBy, [
          "employeeName",
          "name",
          "fullName",
          "employeeCode",
        ]);

        const byWhomName = getDisplayValue(indent.byWhom, [
          "employeeName",
          "name",
          "fullName",
          "employeeCode",
        ]);

        const belongsTo = getDisplayValue(indent.belongsTo, [
          "name",
          "employeeName",
          "departmentName",
          "branchName",
          "code",
        ]);

        return {
          // Database ID
          id: indent.id ?? "",

          // Indent number
          indentNo:
            getDisplayValue(indent.indentNo) ||
            getDisplayValue(indent.docId) ||
            getDisplayValue(indent.id),

          // Plant / Branch
          branch: branchName,

          // Branch code
          branchCode: getDisplayValue(
            indent.branch?.branchCode ?? indent.branchCode,
          ),

          belongsTo,

          department: departmentName,

          preparedBy: preparedByName,

          byWhom: byWhomName,

          indentDate: getDisplayValue(indent.indentDate ?? indent.docDate),

          remarks: getDisplayValue(indent.remarks),

          cancelRemarks: getDisplayValue(indent.cancelRemarks),

          approved:
            indent.approved === true ||
            indent.approved === "true" ||
            indent.approved === 1,

          active:
            indent.active === true ||
            indent.active === "true" ||
            indent.active === 1,

          createdBy: getDisplayValue(indent.createdBy, [
            "employeeName",
            "name",
            "fullName",
          ]),

          orgId: getDisplayValue(indent.orgId),

          // Details
          details: Array.isArray(indent.details)
            ? indent.details
            : Array.isArray(indent.indentDetails)
              ? indent.indentDetails
              : [],

          // Attachments
          attachments: Array.isArray(indent.attachments)
            ? indent.attachments
            : [],
        };
      });

      // ============================================================
      // Sort newest first
      // ============================================================
      transformedData.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading purchase indents:", error);

      toast.error(error?.message || "Failed to load Purchase Indents");

      setItemData([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Initial Load
  // ============================================================
  useEffect(() => {
    loadItems();
  }, []);

  // ============================================================
  // Edit
  // ============================================================
  const handleEdit = (item) => {
    if (!item) {
      return;
    }

    if (onEdit) {
      onEdit(item);
    }
  };

  // ============================================================
  // Generate PDF
  // ============================================================
  const handleDownloadPDF = (row) => {
    try {
      if (!row) {
        toast.error("Invalid Purchase Indent data");
        return;
      }

      // ============================================================
      // Detail Items
      // Units are nested inside the item in the API response
      // ============================================================
      const items = (Array.isArray(row.details) ? row.details : []).map(
        (detail) => {
          const itemObject =
            detail.item && typeof detail.item === "object" ? detail.item : null;

          const primaryUnitObject =
            (detail.primaryUnit && typeof detail.primaryUnit === "object"
              ? detail.primaryUnit
              : null) ??
            itemObject?.primaryUnit ??
            null;

          const purchaseUnitObject =
            (detail.purchaseUnit && typeof detail.purchaseUnit === "object"
              ? detail.purchaseUnit
              : null) ??
            itemObject?.purchaseUnit ??
            null;

          return {
            itemCode:
              getDisplayValue(itemObject?.itemCode) ||
              getDisplayValue(detail.itemCode) ||
              getDisplayValue(detail.item),

            itemDescription:
              getDisplayValue(detail.itemDescription) ||
              getDisplayValue(itemObject?.itemDescription) ||
              getDisplayValue(itemObject?.description),

            primaryUnitLabel:
              getDisplayValue(detail.primaryUnitLabel) ||
              getDisplayValue(primaryUnitObject?.primaryUnit) ||
              getDisplayValue(primaryUnitObject?.unitId) ||
              getDisplayValue(primaryUnitObject?.unitName),

            purchaseUnitLabel:
              getDisplayValue(detail.purchaseUnitLabel) ||
              getDisplayValue(purchaseUnitObject?.primaryUnit) ||
              getDisplayValue(purchaseUnitObject?.unitId) ||
              getDisplayValue(purchaseUnitObject?.unitName),

            qtyInPrimaryUnit: Number(detail.qtyInPrimaryUnit) || 0,

            conversionFactor: Number(detail.conversionFactor) || 0,

            qtyInPurchaseUnit: Number(detail.qtyInPurchaseUnit) || 0,

            requiredDate: getDisplayValue(detail.requiredDate),

            purpose: getDisplayValue(detail.purpose),
          };
        },
      );

      // ============================================================
      // Generate PDF
      // ============================================================
      const result = generatePurchaseIndentPDF({
        company: {
          name: row.branch || "Company Name",
        },

        indent: {
          id: row.id,

          indentNo: row.indentNo || row.id || "",

          plantId: row.branch || "",

          belongsTo: row.belongsTo || "",

          indentDate: row.indentDate || "",

          department: row.department || "",

          preparedBy: row.preparedBy || "",

          byWhom: row.byWhom || "",

          approved: row.approved,

          active: row.active,

          remarks: row.remarks || "",

          cancelRemarks: row.cancelRemarks || "",
        },

        items,
      });

      // ============================================================
      // Preview
      // ============================================================
      if (result && result.blobUrl) {
        setPdfPreview(result);
      } else {
        toast.error("Failed to generate PDF preview");
      }
    } catch (error) {
      console.error("PDF generation failed:", error);

      toast.error(
        "Failed to generate PDF: " + (error?.message || "Unknown error"),
      );
    }
  };

  // ============================================================
  // Table Columns
  // ============================================================
  const columns = [
    {
      key: "indentNo",
      label: "Indent",
      accessor: "indentNo",
      type: "text",
      noWrap: true,
    },

    {
      key: "branch",
      label: "Plant",
      accessor: "branch",
      type: "text",
    },

    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },

    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },

    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: "preparedBy",
      type: "text",
    },

    {
      key: "remarks",
      label: "Remarks",
      accessor: "remarks",
      type: "text",
    },

    {
      key: "approved",
      label: "Approved",
      accessor: "approved",
      type: "status",

      statusVariants: {
        true: {
          label: "Approved",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },

        false: {
          label: "Pending",
          className:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
        },
      },
    },

    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",

      statusVariants: {
        true: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },

        false: {
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

  // ============================================================
  // Search Fields
  // ============================================================
  const searchFields = [
    "indentNo",
    "branch",
    "belongsTo",
    "department",
    "preparedBy",
    "remarks",
  ];

  // ============================================================
  // Filter Options
  // ============================================================
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
      filterValue: true,
      activeValue: true,
    },

    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: false,
      activeValue: false,
    },
  ];

  // ============================================================
  // Render
  // ============================================================
  return (
    <>
      <CommonListViewTable
        title="Purchase Indent"
        data={itemData}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        filterOptions={filterOptions}
        defaultFilter="all"
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={handleEdit}
        onDownload={handleDownloadPDF}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage="No Purchase Indents found"
        loadingMessage="Loading Purchase Indents..."
        enableRefresh={true}
        onRefresh={loadItems}
        enableExport={true}
        exportFileName="PurchaseIndents"
      />

      {/* ========================================================
          PDF Preview Modal
      ======================================================== */}
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

export default PurchaseIndentList;
