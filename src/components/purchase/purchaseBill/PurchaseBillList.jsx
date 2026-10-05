import { useCallback, useEffect, useMemo, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { generatePurchaseBillPdf } from "../../../utils/purchaseBillPdfGenerator";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";
import purchaseBillAPI from "../../../api/Purchase/purchaseBillAPI";
import { useToast } from "../../Toast/ToastContext";

const LOCAL = "Local";
const IMPORT = "Import";

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const deriveType = (row) =>
  Array.isArray(row?.importPurchaseDetails) &&
  row.importPurchaseDetails.length > 0
    ? IMPORT
    : LOCAL;

const deriveBasicValue = (row) => {
  if (deriveType(row) === IMPORT) {
    return toNumber(row?.importBillChargesSummaryDTO?.[0]?.totFobValueInr);
  }

  return toNumber(row?.billChargesSummaryDTO?.[0]?.basicValue);
};

const deriveTotalAmount = (row) => {
  if (deriveType(row) === IMPORT) {
    return toNumber(row?.importBillChargesSummaryDTO?.[0]?.netAmount);
  }

  return toNumber(row?.billChargesSummaryDTO?.[0]?.totalAmount);
};

const deriveTotalQty = (row) => {
  if (deriveType(row) === IMPORT) {
    return toNumber(
      row?.importPurchaseDetails?.reduce(
        (sum, item) => sum + toNumber(item?.accptQty),
        0,
      ),
    );
  }

  return toNumber(row?.billChargesSummaryDTO?.[0]?.totalQty);
};

const deriveTaxAmount = (row) => {
  if (deriveType(row) === IMPORT) {
    return toNumber(
      row?.importPurchaseTax?.reduce(
        (sum, item) => sum + toNumber(item?.taxAmount),
        0,
      ),
    );
  }

  const details = row?.purchaseDetails || [];

  return details.reduce(
    (sum, item) =>
      sum +
      toNumber(item?.sgstAmount) +
      toNumber(item?.cgstAmount) +
      toNumber(item?.igstAmount),
    0,
  );
};

const deriveTaxPercent = (row) => {
  if (deriveType(row) === IMPORT) {
    return toNumber(
      row?.importPurchaseTax?.reduce(
        (sum, item) => sum + toNumber(item?.tax),
        0,
      ),
    );
  }

  const details = row?.purchaseDetails || [];

  return details.reduce((sum, item) => sum + toNumber(item?.taxPercent), 0);
};

const isActive = (value) =>
  value !== false && value !== "Inactive" && value !== "false";

const COLUMNS = [
  {
    key: "docId",
    label: "Doc No",
    accessor: "docId",
    type: "text",
    noWrap: true,
  },
  {
    key: "billType",
    label: "Type",
    accessor: "billType",
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
    key: "supplierCode",
    label: "Supplier Code",
    accessor: "supplierCode",
    type: "text",
    noWrap: true,
  },
  {
    key: "belongsTo",
    label: "Belongs To",
    accessor: "belongsTo",
    type: "text",
    noWrap: true,
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
    key: "grnDate",
    label: "GRN Date",
    accessor: "grnDate",
    type: "text",
    noWrap: true,
  },
  {
    key: "purchaseOrderNo",
    label: "PO No",
    accessor: "purchaseOrderNo",
    type: "text",
    noWrap: true,
  },
  {
    key: "currency",
    label: "Currency",
    accessor: "currency",
    type: "text",
    noWrap: true,
  },
  {
    key: "exchangeRate",
    label: "Exchange Rate",
    accessor: "exchangeRate",
    type: "text",
    align: "right",
  },
  {
    key: "totalQty",
    label: "Total Qty",
    accessor: "totalQty",
    type: "text",
    align: "right",
  },
  {
    key: "basicValue",
    label: "Basic Value",
    accessor: "basicValue",
    type: "text",
    align: "right",
  },
  {
    key: "taxPercent",
    label: "Tax %",
    accessor: "taxPercent",
    type: "text",
    align: "right",
  },
  {
    key: "taxAmount",
    label: "Tax Amount",
    accessor: "taxAmount",
    type: "text",
    align: "right",
  },
  {
    key: "totalAmount",
    label: "Total Amount",
    accessor: "totalAmount",
    type: "text",
    align: "right",
  },
  {
    key: "gstNo",
    label: "GST No",
    accessor: "gstNo",
    type: "text",
    noWrap: true,
  },
  {
    key: "eccType",
    label: "ECC Type",
    accessor: "eccType",
    type: "text",
    noWrap: true,
  },
  {
    key: "igstAppl",
    label: "IGST",
    accessor: "igstAppl",
    type: "text",
    noWrap: true,
  },
  {
    key: "reverseChrg",
    label: "Reverse Charge",
    accessor: "reverseChrg",
    type: "text",
    noWrap: true,
  },
  {
    key: "createdBy",
    label: "Created By",
    accessor: "createdBy",
    type: "text",
    noWrap: true,
  },
  {
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

const SEARCH_FIELDS = [
  "docId",
  "billType",
  "supplierName",
  "supplierCode",
  "belongsTo",
  "grnNo",
  "purchaseOrderNo",
  "gstNo",
  "eccType",
];

const PurchaseBillList = ({ onAddNew, onEdit, onBack }) => {
  const ORG_ID = toNumber(localStorage.getItem("orgId"));
  const BRANCH_ID = toNumber(localStorage.getItem("branchId"));

  const { addToast } = useToast();

  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);

  const rows = useMemo(
    () =>
      allRows.map((row) => ({
        id: row.id,

        docId: row.docId || "",

        billType: deriveType(row),

        supplierName: row?.supplier?.supplierName || "",

        supplierCode: row?.supplier?.supplierCode || "",

        belongsTo: row?.belongsTo || "",

        docDate: row?.docDate || "",

        grnNo: row?.grnNo || "",

        grnDate: row?.grnDate || "",

        purchaseOrderNo: row?.purchaseorderNo || "",

        currency: row?.currency?.currencyName || "",

        exchangeRate: toNumber(row?.exchangeRate).toFixed(2),

        totalQty: deriveTotalQty(row).toFixed(2),

        basicValue: deriveBasicValue(row).toFixed(2),

        taxPercent: deriveTaxPercent(row).toFixed(2),

        taxAmount: deriveTaxAmount(row).toFixed(2),

        totalAmount: deriveTotalAmount(row).toFixed(2),

        gstNo: row?.supplier?.gstNo || "",

        eccType: row?.supplier?.eccType || "",

        igstAppl: row?.igstAppl ? "Yes" : "No",

        reverseChrg: row?.reverseChrg ? "Yes" : "No",

        createdBy: row?.createdBy || "",

        active: isActive(row.active),

        __raw: row,
      })),
    [allRows],
  );

  const loadBills = useCallback(async () => {
    if (!ORG_ID) {
      setAllRows([]);
      return;
    }

    setLoading(true);

    try {
      const response = await purchaseBillAPI.getPurchaseBillByOrgId(
        ORG_ID,
        BRANCH_ID || undefined,
      );

      const data = response?.data ?? response;

      const list = Array.isArray(data)
        ? data
        : data?.paramObjectsMap?.purchaseBillList ||
          data?.paramObjectsMap?.mapp ||
          data?.paramObjectsMap?.purchaseBillVO ||
          [];

      const safeList = Array.isArray(list) ? list : [];

      setAllRows([...safeList].sort((a, b) => (b?.id || 0) - (a?.id || 0)));
    } catch (error) {
      setAllRows([]);
      addToast("Failed to load purchase bills", "error");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const handleEdit = (rowSummary) => {
    if (!rowSummary) return;

    onEdit?.(rowSummary.__raw || rowSummary);
  };

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
      addToast("Failed to generate PDF", "error");
    }
  };

  return (
    <>
      <CommonListViewTable
        title="Purchase Bill"
        data={rows}
        loading={loading}
        columns={COLUMNS}
        searchFields={SEARCH_FIELDS}
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={handleEdit}
        onDownload={handleDownload}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage="No Purchase Bills found"
        loadingMessage="Loading Purchase Bills..."
        enableRefresh={true}
        onRefresh={loadBills}
        enableExport={true}
        exportFileName="Purchase_Bills"
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
