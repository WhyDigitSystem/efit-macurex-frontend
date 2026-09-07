import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";
import subContractSupplyScheduleAPI from "../../../api/SubContract/subContractSupplyScheduleAPI";
import { generateSubContractSupplySchedulePDF } from "../../../utils/generateSubContractSupplySchedulePDF";
import { useToast } from "../../Toast/ToastContext";

const SubContractSupplyScheduleList = ({
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

  // Map API response data to display format
  const mapRecordForDisplay = (record) => {
    return {
      id: record.id,
      docNo: record.docId || record.docNo || "-",
      docDate: record.docDate || "-",
      plantName: record.branch?.branchName || record.plantName || "-",
      belongsTo: record.belongsTo || "-",
      schStartDate: record.schStartDate || "-",
      schEndDate: record.schEndDate || "-",
      partyId: record.customer?.customerCode || record.partyId || "-",
      partyName: record.customer?.customerName || record.partyName || "-",
      contractNo: record.contractNo || "-",
      contractDate: record.contractDate || "-",
      jobOrderNo: record.jobOrderNo || "-",
      preparedBy: record.preparedBy?.employeeName || record.preparedBy || "-",
      authorizedBy: record.authorisedBy?.employeeName || record.authorizedBy || "-",
      active: record.active || "Active",
      remarks: record.remarks || "",
      itemDetails: record.itemDetails || [],
      // Keep original record for PDF generation
      original: record,
    };
  };

  const loadRecords = useCallback(async () => {
    if (!ORG_ID) return;
    try {
      setLoading(true);
      const response = await subContractSupplyScheduleAPI.getSubContractSupplyScheduleByOrgIdAndBranch(
        ORG_ID,
        BRANCH_ID
      );
      console.log("API Response:", response);

      // Extract data from response
      let data = [];
      if (response?.paramObjectsMap?.subContractSupplySchedule) {
        const result = response.paramObjectsMap.subContractSupplySchedule;
        if (Array.isArray(result)) {
          data = result;
        } else {
          data = [result];
        }
      } else if (response?.data?.paramObjectsMap?.subContractSupplySchedule) {
        const result = response.data.paramObjectsMap.subContractSupplySchedule;
        if (Array.isArray(result)) {
          data = result;
        } else {
          data = [result];
        }
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response?.paramObjectsMap?.subContractSupplyScheduleList) {
        data = response.paramObjectsMap.subContractSupplyScheduleList;
      }

      // Sort by ID descending (newest first)
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load sub contract supply schedules:", error);
      setRecords([]);
      addToast("Failed to fetch Sub Contract Supply Schedules", "error");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const handleDownloadPDF = async (row) => {
    try {
      const fullData = await subContractSupplyScheduleAPI.getSubContractSupplyScheduleById(
        row.id,
      );
      if (!fullData) {
        addToast("Sub Contract Supply Schedule data not found", "error");
        return;
      }
      const { blobUrl, fileName } =
        await generateSubContractSupplySchedulePDF(fullData);
      setPdfPreview({ open: true, blobUrl, fileName });
    } catch (error) {
      console.error("PDF generation error:", error);
      addToast("Failed to generate PDF", "error");
    }
  };

  const columns = [
    {
      key: "docNo",
      label: "Doc No",
      accessor: "docNo",
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
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
      key: "schStartDate",
      label: "Sch. Start Date",
      accessor: "schStartDate",
      type: "text",
    },
    {
      key: "schEndDate",
      label: "Sch. End Date",
      accessor: "schEndDate",
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
      key: "jobOrderNo",
      label: "Job Order No",
      accessor: "jobOrderNo",
      type: "text",
    },
    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: "preparedBy",
      type: "text",
    },
    {
      key: "authorizedBy",
      label: "Authorized By",
      accessor: "authorizedBy",
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
        "": {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
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
    "docNo",
    "docDate",
    "plantName",
    "belongsTo",
    "schStartDate",
    "schEndDate",
    "partyId",
    "partyName",
    "contractNo",
    "jobOrderNo",
    "preparedBy",
    "authorizedBy",
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
        title="Sub Contract Supply Schedule"
        data={records.map(mapRecordForDisplay)}
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
        emptyMessage="No Sub Contract Supply Schedules found"
        loadingMessage="Loading Sub Contract Supply Schedules..."
        enableRefresh={true}
        onRefresh={loadRecords}
        enableExport={true}
        exportFileName="SubContractSupplySchedules"
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

export default SubContractSupplyScheduleList;