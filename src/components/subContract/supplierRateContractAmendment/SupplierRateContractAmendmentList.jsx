import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";
import { generateSupplierRateContractAmendmentPDF } from "../../../utils/generateSupplierRateContractAmendmentPDF";
import { useToast } from "../../Toast/ToastContext";
import supplierRateContractAmendmentAPI from "../../../api/SubContract/supplierRateContractAmendmentAPI";

const SupplierRateContractAmendmentList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
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
      const response = await supplierRateContractAmendmentAPI.getSupplierRateContractAmendmentByOrgIdAndBranch(
        ORG_ID,
        BRANCH_ID,
      );
      console.log("API Response:", response);

      // Extract the array from the response
      let data = [];
      if (response?.paramObjectsMap?.supplierRateContractAmendment) {
        data = response.paramObjectsMap.supplierRateContractAmendment;
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response?.data?.paramObjectsMap?.supplierRateContractAmendment) {
        data = response.data.paramObjectsMap.supplierRateContractAmendment;
      }

      // Map the data to match the table columns
      const mappedData = data.map((item) => ({
        id: item.id,
        amendmentNo: item.docId || "",
        amendmentDate: item.docDate || "",
        plantName: item.branch?.branchName || "",
        belongsTo: item.belongsTo || "",
        partyId: item.customer?.customerId || "",
        partyName: item.customer?.customerName || "",
        contractNo: item.contractNo || "",
        contractDate: item.contractDate || "",
        newValidFrom: item.newValidFrom || "",
        newValidTo: item.newValidTo || "",
        revisionNo: item.revisionNo || "",
        active: item.active || "Inactive",
        // Store the full data for PDF generation
        _fullData: item,
      }));

      // Sort by ID descending (newest first)
      mappedData.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(mappedData);
    } catch (error) {
      console.error("Failed to load supplier rate contract amendments:", error);
      addToast("Failed to load records", "error");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const handleDownloadPDF = async (row) => {
    try {
      // Use the full data stored in the row, or fetch by ID if needed
      let fullData = row._fullData;

      if (!fullData) {
        // Fallback to fetching by ID if full data is not available
        const response = await supplierRateContractAmendmentAPI.getSupplierRateContractAmendmentById(
          row.id,
        );
        fullData = response?.paramObjectsMap?.supplierRateContractAmendment || response;
      }

      if (!fullData) {
        addToast("Supplier Rate Contract Amendment data not found", "error");
        return;
      }

      const { blobUrl, fileName } =
        await generateSupplierRateContractAmendmentPDF(fullData);
      setPdfPreview({ open: true, blobUrl, fileName });
    } catch (error) {
      console.error("PDF generation error:", error);
      addToast("Failed to generate PDF", "error");
    }
  };

  const columns = [
    {
      key: "amendmentNo",
      label: "Amendment No",
      accessor: "amendmentNo",
      type: "text",
    },
    {
      key: "amendmentDate",
      label: "Amendment Date",
      accessor: "amendmentDate",
      type: "text",
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: "plantName",
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },
    {
      key: "partyId",
      label: "Party Id",
      accessor: "partyId",
      type: "text",
    },
    {
      key: "partyName",
      label: "Party Name",
      accessor: "partyName",
      type: "text",
    },
    {
      key: "contractNo",
      label: "Contract No",
      accessor: "contractNo",
      type: "text",
    },
    {
      key: "contractDate",
      label: "Contract Date",
      accessor: "contractDate",
      type: "text",
    },
    {
      key: "newValidFrom",
      label: "New Valid From",
      accessor: "newValidFrom",
      type: "text",
    },
    {
      key: "newValidTo",
      label: "New Valid To",
      accessor: "newValidTo",
      type: "text",
    },
    {
      key: "revisionNo",
      label: "Revision No",
      accessor: "revisionNo",
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

  const searchFields = [
    "amendmentNo",
    "amendmentDate",
    "plantName",
    "belongsTo",
    "partyId",
    "partyName",
    "contractNo",
    "contractDate",
    "newValidFrom",
    "newValidTo",
    "revisionNo",
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
        title="Supplier Rate Contract Amendment"
        data={records}
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
        emptyMessage="No Supplier Rate Contract Amendments found"
        loadingMessage="Loading Supplier Rate Contract Amendments..."
        enableRefresh={true}
        onRefresh={loadRecords}
        enableExport={true}
        exportFileName="SupplierRateContractAmendments"
      />
      <PDFPreviewModal
        isOpen={pdfPreview.open}
        onClose={() => {
          if (pdfPreview.blobUrl) {
            URL.revokeObjectURL(pdfPreview.blobUrl);
          }
          setPdfPreview({ open: false, blobUrl: null, fileName: "" });
        }}
        blobUrl={pdfPreview.blobUrl}
        fileName={pdfPreview.fileName}
      />
    </>
  );
};

export default SupplierRateContractAmendmentList;