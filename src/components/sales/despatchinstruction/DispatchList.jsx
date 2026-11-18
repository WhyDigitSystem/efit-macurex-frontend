import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import despatchInstructionAPI from "../../../api/Sales/despatchInstructionAPI";
import { toast } from "../../../utils/toast";
import generateDispatchInstructionPDF from "./DispatchInstructionPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const safeStr = (v) => {
  if (v === undefined || v === null) return "";
  const s = String(v).trim();
  return s.length === 0 ? "" : s;
};

const safeNum = (v) => {
  if (v === undefined || v === null || v === "") return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const DispatchList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await despatchInstructionAPI.getDispatchByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(list);
    } catch (error) {
      console.error("Failed to load despatch instructions:", error);
      setRecords([]);
      toast.error("Failed to fetch Despatch Instructions");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const handleEdit = async (row) => {
    try {
      toast.info("Loading record details...");
      const record = await despatchInstructionAPI.getDispatchById(row.id);
      if (record) {
        onEdit(record);
      } else {
        toast.error("Failed to fetch record details");
      }
    } catch (error) {
      console.error("Error fetching record for edit:", error);
      toast.error("Failed to fetch record details");
    }
  };

  /* =========================================================
     PDF DOWNLOAD
     ========================================================= */
  const handleDownloadPDF = async (row) => {
    try {
      // Fetch the full record so we always have details + all fields
      let raw = row;
      try {
        const full = await despatchInstructionAPI.getDispatchById(row.id);
        if (full) raw = full;
      } catch {
        // fall through with row-level data
      }

      const details = Array.isArray(raw.despatchInstDetailsResponseDTO)
        ? raw.despatchInstDetailsResponseDTO
        : [];

      const result = generateDispatchInstructionPDF({
        company: {
          name: raw.branch?.branchName || "Company Name",
        },
        dispatch: {
          id: raw.id,
          docId: safeStr(raw.docId),
          docDate: raw.docDate || "",
          scheduleNo: safeStr(raw.schduleNo || raw.scheduleNo),
          scheduleDate: raw.schduleDate || raw.schDate || "",
          invoiceType: safeStr(raw.invoiceType),
          paymentTerms: safeStr(raw.paymentTerms),
          customerName: safeStr(raw.customer?.customerName),
          branchName: safeStr(raw.branch?.branchName),
          locationName: safeStr(raw.location?.locationName),
          modeOfTransport: safeStr(raw.modeOfTransport),
          consignee: safeStr(raw.consignee),
          active:
            raw.active === "Active" || raw.active === true
              ? "Active"
              : "Inactive",
          netWeight: safeNum(raw.netWeight),
          grossWeight: safeNum(raw.grossWeight),
          deliveryInstructions: safeStr(raw.deliveryInstructions),
          createdBy: safeStr(raw.createdBy),
        },
        dispatchDetails: details,
      });

      if (result?.blobUrl) {
        setPdfPreview(result);
      } else {
        toast.error("Failed to generate PDF preview");
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF: " + error.message);
    }
  };

  const columns = [
    {
      key: "diNo",
      label: "Dispatch No",
      accessor: (row) => row.docId || row.diNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "schduleDate",
      label: "Sch. Date",
      accessor: (row) => row.schduleDate || row.schDate,
      type: "date",
    },
    {
      key: "schduleNo",
      label: "Schedule No",
      accessor: (row) => row.schduleNo || row.scheduleNo,
      type: "text",
    },
    {
      key: "branch",
      label: "Plant",
      accessor: (row) =>
        typeof row.branch === "object"
          ? row.branch.branchName || row.branch.id
          : row.branchName || row.branch,
      type: "text",
    },
    {
      key: "customer",
      label: "Party Id",
      accessor: (row) =>
        typeof row.customer === "object" ? row.customer.id : row.customer,
      type: "text",
    },
    {
      key: "partyName",
      label: "Party Name",
      accessor: (row) =>
        typeof row.customer === "object"
          ? row.customer.customerName
          : row.customerName || row.partyName,
      type: "text",
    },
    {
      key: "location",
      label: "From Location",
      accessor: (row) =>
        typeof row.location === "object"
          ? row.location.locationName || row.location.id
          : row.locationName || row.location,
      type: "text",
    },
    {
      key: "modeOfTransport",
      label: "Mode of Transport",
      accessor: "modeOfTransport",
      type: "text",
    },
    {
      key: "netWeight",
      label: "Net Weight",
      accessor: "netWeight",
      type: "text",
    },
    {
      key: "grossWeight",
      label: "Gross Weight",
      accessor: "grossWeight",
      type: "text",
    },
    {
      key: "consignee",
      label: "Consignee",
      accessor: "consignee",
      type: "text",
    },
    {
      key: "invoiceType",
      label: "Invoice Type",
      accessor: "invoiceType",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) => {
        if (row.active === null || row.active === undefined) {
          return "Active";
        }
        return row.active ? "Active" : "Inactive";
      },
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

  const searchFields = [
    "docId",
    "diNo",
    "schduleNo",
    "scheduleNo",
    "schduleDate",
    "schDate",
    "branch.branchName",
    "customer.customerName",
    "customerName",
    "partyName",
    "location.locationName",
    "locationName",
    "modeOfTransport",
    "consignee",
    "invoiceType",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
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
      activeValue: "Active",
    },
  ];

  return (
    <>
      <CommonListViewTable
        title="Dispatch Instruction List"
        data={records}
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
        emptyMessage="No Dispatch Instructions found"
        loadingMessage="Loading Dispatch Instructions..."
        enableRefresh={true}
        onRefresh={loadRecords}
        enableExport={true}
        exportFileName="DispatchInstructions"
      />

      {pdfPreview && (
        <PDFPreviewModal
          blobUrl={pdfPreview.blobUrl}
          fileName={pdfPreview.fileName}
          onClose={() => {
            if (pdfPreview.blobUrl)
              URL.revokeObjectURL(pdfPreview.blobUrl);
            setPdfPreview(null);
          }}
        />
      )}
    </>
  );
};

export default DispatchList;