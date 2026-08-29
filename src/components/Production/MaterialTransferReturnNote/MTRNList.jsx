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
    if (!ORG_ID) return;
    try {
      setLoading(true);
      const data = await materialTransferReturnNoteAPI.getByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
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

  const columns = [
    {
      key: "mtrnNo",
      label: "MTRN No",
      accessor: (row) => row.mtrnNo || row.docNo || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "mtrnDate",
      label: "MTRN Date",
      accessor: (row) => row.mtrnDate || row.docDate || "",
      type: "date",
      noWrap: true,
    },
    {
      key: "type",
      label: "Type",
      accessor: (row) => row.type || "",
      type: "text",
    },
    {
      key: "plantId",
      label: "Branch",
      accessor: (row) =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.plantName || row.plantId.id
          : row.plantName || row.plantId,
      type: "text",
    },
    {
      key: "fgSfgPartNo",
      label: "FG/SFG Part No",
      accessor: (row) =>
        typeof row.fgSfgPartNo === "object"
          ? row.fgSfgPartNo.itemCode || row.fgSfgPartNo.id
          : row.fgSfgPartNo || "",
      type: "text",
    },
    {
      key: "subOrderNo",
      label: "Sub Order No",
      accessor: (row) =>
        typeof row.subOrderNo === "object"
          ? row.subOrderNo.docId || row.subOrderNo.id
          : row.subOrderNo || "",
      type: "text",
    },
    {
      key: "fromLocation",
      label: "From Location",
      accessor: (row) =>
        typeof row.fromLocation === "object"
          ? row.fromLocation.locationName || row.fromLocation.id
          : row.fromLocation || "",
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: (row) =>
        typeof row.toLocation === "object"
          ? row.toLocation.locationName || row.toLocation.id
          : row.toLocation || "",
      type: "text",
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
    "mtrnNo",
    "mtrnDate",
    "type",
    "plantId",
    "fgSfgPartNo",
    "subOrderNo",
    "fromLocation",
    "toLocation",
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