import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { generatePurchaseBillPdf } from "../../../utils/purchaseBillPdfGenerator";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";
import purchaseBillAPI from "../../../api/Purchase/purchaseBillAPI";
import { useToast } from "../../Toast/ToastContext";

const LOCAL = "Local";
const IMPORT = "Import";

const TYPE_TABS = [
  { value: LOCAL, label: "Purchase Bill" },
  { value: IMPORT, label: "Import Purchase Bill" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const idOf = (value) => {
  if (value && typeof value === "object") return value.id ?? "";
  return value ?? "";
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const deriveType = (row) =>
  Array.isArray(row?.importPurchaseDetails) &&
  row.importPurchaseDetails.length > 0
    ? IMPORT
    : LOCAL;

const deriveTotalAmount = (row) => {
  if (deriveType(row) === IMPORT) {
    return toNumber(row?.importBillChargesSummaryDTO?.[0]?.netAmount);
  }

  return toNumber(row?.billChargesSummaryDTO?.[0]?.totalAmount);
};

/* ------------------------------------------------------------------ */
/* Columns                                                            */
/* ------------------------------------------------------------------ */

const ACTIVE_COLUMN = {
  key: "active",
  label: "Active",
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
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
  },
};

const ACTIONS_COLUMN = {
  key: "actions",
  label: "Actions",
  type: "actions",
  align: "center",
  width: "90px",
};

const COLUMNS_BY_TYPE = {
  [LOCAL]: [
    {
      key: "docId",
      label: "Doc No",
      accessor: "docId",
      type: "text",
      noWrap: true,
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: "supplierName",
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
      type: "text",
      noWrap: true,
    },
    {
      key: "grnNo",
      label: "GRN No",
      accessor: "grnNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: "totalAmount",
      type: "text",
      align: "right",
    },
    ACTIVE_COLUMN,
    ACTIONS_COLUMN,
  ],

  [IMPORT]: [
    {
      key: "docId",
      label: "Doc No",
      accessor: "docId",
      type: "text",
      noWrap: true,
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: "supplierName",
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
      type: "text",
      noWrap: true,
    },
    {
      key: "grnNo",
      label: "GRN No",
      accessor: "grnNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "supplierDcInvNo",
      label: "Supp. Inv No",
      accessor: "supplierDcInvNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "totalAmount",
      label: "Net Amount",
      accessor: "totalAmount",
      type: "text",
      align: "right",
    },
    ACTIVE_COLUMN,
    ACTIONS_COLUMN,
  ],
};

/* ------------------------------------------------------------------ */
/* Config                                                             */
/* ------------------------------------------------------------------ */

const CONFIG_BY_TYPE = {
  [LOCAL]: {
    title: "Purchase Bill",
    searchFields: ["docId", "supplierName", "grnNo"],
    emptyMessage: "No Purchase Bills found",
    loadingMessage: "Loading Purchase Bills...",
    exportFileName: "Purchase_Bills",
  },

  [IMPORT]: {
    title: "Import Purchase Bill",
    searchFields: ["docId", "supplierName", "grnNo", "supplierDcInvNo"],
    emptyMessage: "No Import Purchase Bills found",
    loadingMessage: "Loading Import Purchase Bills...",
    exportFileName: "Import_Purchase_Bills",
  },
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

const PurchaseBillList = ({ type, onTypeChange, onAddNew, onEdit, onBack }) => {
  const ORG_ID = toNumber(localStorage.getItem("orgId"));
  const BRANCH_ID = toNumber(localStorage.getItem("branchId"));

  const { addToast } = useToast();

  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);

  /*
   * IMPORTANT:
   * If parent does not pass type, use Local.
   *
   * This prevents:
   * CONFIG_BY_TYPE[undefined]
   * from returning undefined.
   */
  const activeType = type === LOCAL || type === IMPORT ? type : LOCAL;

  const config = CONFIG_BY_TYPE[activeType];

  const columns = COLUMNS_BY_TYPE[activeType] || COLUMNS_BY_TYPE[LOCAL];

  /* ---------------------------------------------------------------- */
  /* Rows                                                             */
  /* ---------------------------------------------------------------- */

  const rowsForType = allRows
    .filter((row) => deriveType(row) === activeType)
    .map((row) => ({
      id: row.id,
      docId: row.docId || "",
      supplierName: row.supplier?.supplierName || "",
      docDate: row.docDate || "",
      grnNo: row.grnNo || "",
      supplierDcInvNo: row.supplierDcInvNo || "",
      totalAmount: deriveTotalAmount(row).toFixed(2),
      active: row.active !== false,

      // Keep original response for Edit/PDF
      __raw: row,
    }));

  /* ---------------------------------------------------------------- */
  /* PDF                                                              */
  /* ---------------------------------------------------------------- */

  const handleDownload = async (rowSummary) => {
    try {
      const result = await generatePurchaseBillPdf(
        rowSummary?.__raw || rowSummary,
      );

      if (result?.blobUrl) {
        setPdfPreview(result);
      } else {
        addToast("Failed to generate PDF preview", "error");
      }
    } catch (error) {
      console.error(`Error generating ${config.title} PDF:`, error);

      addToast("Failed to generate PDF", "error");
    }
  };

  /* ---------------------------------------------------------------- */
  /* Load Bills                                                       */
  /* ---------------------------------------------------------------- */

  const loadBills = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      setAllRows([]);
      return;
    }

    setLoading(true);

    try {
      const response = await purchaseBillAPI.getPurchaseBillByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      const data = response?.data ?? response;

      const list = Array.isArray(data)
        ? data
        : data?.paramObjectsMap?.purchaseBillList ||
          data?.paramObjectsMap?.mapp ||
          data?.paramObjectsMap?.purchaseBillVO ||
          [];

      const safeList = Array.isArray(list) ? list : [];

      const sorted = [...safeList].sort((a, b) => (b?.id || 0) - (a?.id || 0));

      setAllRows(sorted);
    } catch (error) {
      console.error("Failed to load purchase bills:", error);

      setAllRows([]);

      addToast("Failed to load purchase bills", "error");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  /* ---------------------------------------------------------------- */
  /* Edit                                                             */
  /* ---------------------------------------------------------------- */

  const handleEdit = (rowSummary) => {
    if (!rowSummary) return;

    onEdit?.(rowSummary.__raw || rowSummary);
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      {/* Type switcher */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-2">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTypeChange?.(tab.value)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${
              activeType === tab.value
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <CommonListViewTable
        key={activeType}
        title={config.title}
        data={rowsForType}
        loading={loading}
        columns={columns}
        searchFields={config.searchFields}
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={handleEdit}
        onDownload={handleDownload}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage={config.emptyMessage}
        loadingMessage={config.loadingMessage}
        enableRefresh={true}
        onRefresh={loadBills}
        enableExport={true}
        exportFileName={config.exportFileName}
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

export default PurchaseBillList;
