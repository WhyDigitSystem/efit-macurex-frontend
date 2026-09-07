import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import subContractingDCAPI from "../../../api/SubContract/subContractingDCAPI";
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
          record?.details ||
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
      const response = await subContractingDCAPI.getAllDeliveryChallanSubcontractingByOrgIdAndBranch(
        ORG_ID,
        BRANCH_ID
      );
      console.log("API Response:", response);

      // Extract data from response
      let data = [];
      if (response?.paramObjectsMap?.deliveryChallanSubcontracting) {
        const result = response.paramObjectsMap.deliveryChallanSubcontracting;
        // Check if it's an array or single object
        if (Array.isArray(result)) {
          data = result;
        } else {
          data = [result];
        }
      } else if (response?.data?.paramObjectsMap?.deliveryChallanSubcontracting) {
        const result = response.data.paramObjectsMap.deliveryChallanSubcontracting;
        if (Array.isArray(result)) {
          data = result;
        } else {
          data = [result];
        }
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response?.paramObjectsMap?.deliveryChallanSubcontractingList) {
        data = response.paramObjectsMap.deliveryChallanSubcontractingList;
      }

      // Sort by ID descending (newest first)
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

  // Map API response fields to display fields
  const mapRecordForDisplay = (record) => {
    return {
      id: record.id,
      scDcNo: record.docId || record.scDcNo || "-",
      scDcDate: record.docDate || record.scDcDate || "-",
      plantName: record.branch?.branchName || record.plantName || "-",
      belongsTo: record.belongsTo || "-",
      department: record.department?.departmentName || record.department || "-",
      vendorId: record.vendor?.customerCode || record.vendorId || "-",
      vendorName: record.vendor?.customerName || record.vendorName || "-",
      jobOrderNo: record.jobOrderNo || "-",
      partyLocation: record.partyLocation?.locationName || record.partyLocation || "-",
      dcType: record.dcType || "-",
      approvalByStores: record.approvalByStores || "-",
      preparedBy: record.preparedBy?.employeeName || record.preparedBy || "-",
      approvedBy: record.approvedBy?.employeeName || record.approvedBy || "-",
      active: record.active || "Active",
      details: record.details || [],
      // Keep original record for PDF generation
      original: record,
    };
  };

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