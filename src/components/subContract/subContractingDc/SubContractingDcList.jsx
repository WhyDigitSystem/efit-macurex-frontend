import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import subContractingDcAPI from "../../../api/subContractingDcAPI";
import { toast } from "../../../utils/toast";
import generateSubContractingDcPDF from "../../../utils/generateSubContractingDcPDF";

const SubContractingDcList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");
  const handleDownloadPDF = (record) => {
    try {
      const result = generateSubContractingDcPDF({
        company: {
          name:
            JSON.parse(localStorage.getItem("userData") || "{}")?.companyVO
              ?.companyName || "Company Name",
        },

        dc: record,

        items:
          record?.outgoingItems ||
          record?.outGoingItems ||
          record?.outgoingItemDetails ||
          [],

        summary: record?.summary || {},
      });

      const link = document.createElement("a");

      link.href = result.blobUrl;
      link.download = result.fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(result.blobUrl);
      }, 1000);
    } catch (error) {
      console.error("Failed to generate Sub Contracting DC PDF:", error);

      toast.error("Failed to generate PDF");
    }
  };
  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await subContractingDcAPI.getSubContractingDcByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load sub contracting DCs:", error);
      setRecords([]);
      toast.error("Failed to fetch Sub Contracting DCs");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "scDcNo",
      label: "SC DC No",
      accessor: "scDcNo",
      type: "text",
    },
    {
      key: "scDcDate",
      label: "SC DC Date",
      accessor: "scDcDate",
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
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },
    {
      key: "vendorId",
      label: "Vendor Id",
      accessor: "vendorId",
      type: "text",
    },
    {
      key: "vendorName",
      label: "Vendor Name",
      accessor: "vendorName",
      type: "text",
    },
    {
      key: "jobOrderNo",
      label: "Job Order No",
      accessor: "jobOrderNo",
      type: "text",
    },
    {
      key: "partyLocation",
      label: "Party Location",
      accessor: "partyLocation",
      type: "text",
    },
    {
      key: "dcType",
      label: "D.C Type",
      accessor: "dcType",
      type: "text",
    },
    {
      key: "approvalByStores",
      label: "Stores Approval",
      accessor: "approvalByStores",
      type: "text",
    },
    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: "preparedBy",
      type: "text",
    },
    {
      key: "approvedBy",
      label: "Approved By",
      accessor: "approvedBy",
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
    "scDcNo",
    "scDcDate",
    "plantName",
    "belongsTo",
    "department",
    "vendorId",
    "vendorName",
    "jobOrderNo",
    "partyLocation",
    "dcType",
    "approvalByStores",
    "preparedBy",
    "approvedBy",
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
    <CommonListViewTable
      title="D.C For Sub Contracting"
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
      emptyMessage="No Sub Contracting DCs found"
      loadingMessage="Loading Sub Contracting DCs..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="SubContractingDCs"
    />
  );
};

export default SubContractingDcList;
