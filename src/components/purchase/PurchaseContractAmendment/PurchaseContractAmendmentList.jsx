import { useState, useEffect, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import purchaseContractAmendmentAPI from "../../../api/Purchase/purchaseContractAmendmentAPI";
import { generatePurchaseContractAmendmentPdf } from "../../../utils/generatePurchaseContractAmendmentPdf";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";
import { useToast } from "../../Toast/ToastContext";

const PurchaseContractAmendmentList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const { addToast } = useToast();

  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branchId = Number(localStorage.getItem("branchId")) || 1000000001;

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const list = await purchaseContractAmendmentAPI.getAll(orgId, branchId);

      const transformedData = (list || []).map((item) => ({
        id: item.id,
        amendmentNo: item.docId || "",
        amendmentDate: item.docDate || "",
        contractNo: item.contractNo || item.purchaseContractNumber || "",
        contractDate: item.contractDate || "",
        partyName: item.customer?.customerName || "",
        partyCode: item.customer?.customerCode || "",
        branch: item.branch?.branchName || "",
        revisionNo: item.revisionNo ?? "",
        active: item.active,
        details: item.details || [],
        attachments: item.attachments || [],
        remarks: item.remarks || "",
        freightType: item.freightType || "",
        packingType: item.packingType || "",
        insuranceAmount: item.insuranceAmount ?? "",
        modeOfDespatch: item.modeOfDespatch || "",
        taxDescription: item.taxDescription || "",
        preparedBy: item.preparedBy || "",
        authorisedBy: item.authorisedBy || "",
        createdBy: item.createdBy || "",
      }));

      transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(transformedData);
    } catch (error) {
      console.error("Failed to load PC amendments:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, branchId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const handleDownload = async (row) => {
    try {
      const result = await generatePurchaseContractAmendmentPdf(row);

      if (result && result.blobUrl) {
        setPdfPreview(result);
      } else {
        addToast("Failed to generate PDF preview", "error");
      }
    } catch (error) {
      console.error("Error generating PC Amendment PDF:", error);
      addToast("Failed to generate PDF: " + error.message, "error");
    }
  };

  const columns = [
    {
      key: "amendmentNo",
      label: "Amendment No",
      type: "text",
      accessor: (row) => row.amendmentNo || "",
    },
    {
      key: "amendmentDate",
      label: "Amendment Date",
      type: "date",
      accessor: (row) => row.amendmentDate || "",
    },
    {
      key: "contractNo",
      label: "Contract No",
      type: "text",
      accessor: (row) => row.contractNo || "",
    },
    {
      key: "partyName",
      label: "Party Name",
      type: "text",
      accessor: (row) => row.partyName || "",
    },
    {
      key: "revisionNo",
      label: "Revision",
      type: "text",
      accessor: (row) => row.revisionNo ?? "",
    },
    {
      key: "status",
      label: "Status",
      type: "status",
      accessor: (row) => (row.active !== false ? "Active" : "Inactive"),
      statusVariants: {
        Active:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        Inactive:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      },
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      onEdit: (row) => onEdit(row),
    },
  ];

  const searchFields = ["amendmentNo", "contractNo", "partyName"];

  const filterOptions = [
    { value: "all", label: "All", activeValue: "All" },
    { value: "active", label: "Active", activeValue: "Active" },
    { value: "inactive", label: "Inactive", activeValue: "Inactive" },
  ];

  return (
    <>
      <CommonListViewTable
        title="Purchase Contract Amendment"
        subtitle="Manage purchase contract amendments and revisions"
        data={data}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        filterOptions={filterOptions}
        defaultFilter="all"
        onAddNew={onAddNew}
        onEdit={onEdit}
        onBack={onBack}
        onDownload={handleDownload}
        emptyMessage="No PC amendments found"
      />

      {pdfPreview && (
        <PDFPreviewModal
          blobUrl={pdfPreview.blobUrl}
          fileName={pdfPreview.fileName}
          onClose={() => {
            if (pdfPreview.blobUrl) URL.revokeObjectURL(pdfPreview.blobUrl);
            setPdfPreview(null);
          }}
        />
      )}
    </>
  );
};

export default PurchaseContractAmendmentList;
