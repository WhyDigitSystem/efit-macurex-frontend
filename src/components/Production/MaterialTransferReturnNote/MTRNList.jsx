import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";
import materialTransferReturnNoteAPI from "../../../api/Production/materialTransferReturnNoteAPI";
import { generateMaterialTransferReturnNotePDF } from "../../../utils/generateMaterialTransferReturnNotePDF";
import { useToast } from "../../Toast/ToastContext";

const MTRNList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({
    open: false,
    blobUrl: null,
    fileName: "",
  });
  const { addToast } = useToast();

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const loadRecords = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;
    try {
      setLoading(true);

      const data = await materialTransferReturnNoteAPI.getByOrgIdAndBranch({
        branch: BRANCH_ID,
        orgId: ORG_ID,
      });

      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch MTRN records:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const handleDownloadPDF = async (row) => {
    try {
      const fullData = await materialTransferReturnNoteAPI.getById(row.id);
      if (!fullData) {
        addToast("Material Transfer/Return Note data not found", "error");
        return;
      }
      const { blobUrl, fileName } =
        await generateMaterialTransferReturnNotePDF(fullData);
      setPdfPreview({ open: true, blobUrl, fileName });
    } catch (error) {
      console.error("PDF generation error:", error);
      addToast("Failed to generate PDF", "error");
    }
  };

  /* ---------------- Accessors ---------------- */

  const getBranchLabel = (row) =>
    row?.branch?.branchName ||
    row?.branch?.branchCode ||
    row?.branch?.id ||
    "";

  const getFgItemLabel = (row) =>
    row?.fgItem?.itemCode ||
    row?.fgItem?.itemDescription ||
    row?.fgItem?.id ||
    "";

  const getFromLocationLabel = (row) =>
    row?.fromLocation?.locationName || row?.fromLocation?.id || "";

  const getToLocationLabel = (row) =>
    row?.toLocation?.locationName || row?.toLocation?.id || "";

  /* ---------------- Columns ---------------- */

  const columns = [
    {
      key: "docId",
      label: "MTRN No",
      accessor: (row) => row?.docId || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "MTRN Date",
      accessor: (row) => row?.docDate || "",
      type: "date",
      noWrap: true,
    },
    {
      key: "type",
      label: "Type",
      accessor: (row) => row?.type || "",
      type: "text",
    },
    {
      key: "branch",
      label: "Branch",
      accessor: (row) => getBranchLabel(row),
      type: "text",
    },
    {
      key: "fgItem",
      label: "FG/SFG Part No",
      accessor: (row) => getFgItemLabel(row),
      type: "text",
    },
    {
      key: "schOrderNo",
      label: "Sub Order No",
      accessor: (row) => row?.schOrderNo || "",
      type: "text",
    },
    {
      key: "fromLocation",
      label: "From Location",
      accessor: (row) => getFromLocationLabel(row),
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: (row) => getToLocationLabel(row),
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) =>
        row?.active === true ||
          row?.active === "Active" ||
          row?.active === "Y"
          ? "Active"
          : "Inactive",
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
      width: "120px",
    },
  ];

  const searchFields = [
    "docId",
    "type",
    "branch.branchName",
    "fgItem.itemCode",
    "schOrderNo",
    "fromLocation.locationName",
    "toLocation.locationName",
  ];

  return (
    <>
      <CommonListViewTable
        title="Material Transfer/Return Note"
        data={records}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={onEdit}
        onDownload={handleDownloadPDF}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage="No Material Transfer/Return Notes found"
        loadingMessage="Loading Material Transfer/Return Notes..."
        enableRefresh={true}
        onRefresh={loadRecords}
      />
      <PDFPreviewModal
        isOpen={pdfPreview.open}
        onClose={() => {
          URL.revokeObjectURL(pdfPreview.blobUrl);
          setPdfPreview({ open: false, blobUrl: null, fileName: "" });
        }}
        blobUrl={pdfPreview.blobUrl}
        fileName={pdfPreview.fileName}
      />
    </>
  );
};

export default MTRNList;