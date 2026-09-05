import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import jobOrderAPI from "../../../api/SubContract/jobOrderAPI";
import { useToast } from "../../Toast/ToastContext";

const JobOrderList = ({ onAddNew, onEdit, refreshTrigger, onBack }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      console.warn("Missing orgId or branchId");
      return;
    }

    try {
      setLoading(true);
      const response = await jobOrderAPI.getJobOrderByOrgId(ORG_ID, BRANCH_ID);

      console.log("Job Order API Response:", response);

      // Extract the data from the response structure
      let data = [];
      if (response?.paramObjectsMap?.jobOrder) {
        data = response.paramObjectsMap.jobOrder;
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response?.data?.paramObjectsMap?.jobOrder) {
        data = response.data.paramObjectsMap.jobOrder;
      }

      // Transform data for display
      const transformedData = data.map((item) => ({
        id: item.id,
        jobOrderNo: item.docId || item.jobOrderNo || "",
        date: item.docDate || item.date || "",
        plantId: item.branch?.branchName || item.plantId || "",
        department: item.department?.departmentName || item.department || "",
        vendorId: item.vendor?.customerCode || item.vendorId || "",
        vendorName: item.vendor?.customerName || item.vendorName || "",
        jobOrderFor: item.jobOrderFor || "",
        contractNo: item.contractNo || "",
        gstState: item.gstState?.gstState || item.gstState || "",
        gstStateId: item.gstState?.id || "",
        serviceName: item.serviceName?.serviceName || "",
        serviceId: item.serviceName?.id || "",
        hsnSacCode: item.hsnSacCode?.hsn || "",
        hsnId: item.hsnSacCode?.id || "",
        taxType: item.taxType || "",
        taxPercentage: item.taxPercentage || "",
        paymentTerms: item.paymentTerms || "",
        deliveryDate: item.deliveryDate || "",
        amount: item.amount || "",
        narration: item.narration || "",
        note: item.note || "",
        active: item.active === "Active" ? "Active" : "Inactive",
        igstAppl: item.igstAppl || false,
        // Keep the full object for edit
        _rawData: item,
      }));

      // Sort by ID descending (newest first)
      transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(transformedData);
    } catch (error) {
      console.error("Failed to load job orders:", error);
      setRecords([]);
      addToast("Failed to fetch Job Orders", "error");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const handleEdit = (record) => {
    if (onEdit) {
      // Pass the raw data for editing
      onEdit(record._rawData || record);
    }
  };

  const columns = [
    {
      key: "jobOrderNo",
      label: "Job Order No",
      accessor: "jobOrderNo",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant ID",
      accessor: "plantId",
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
      key: "jobOrderFor",
      label: "Job Order For",
      accessor: "jobOrderFor",
      type: "text",
    },
    {
      key: "contractNo",
      label: "Contract No",
      accessor: "contractNo",
      type: "text",
    },
    {
      key: "gstState",
      label: "GST State",
      accessor: "gstState",
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
    "jobOrderNo",
    "date",
    "plantId",
    "department",
    "vendorId",
    "vendorName",
    "jobOrderFor",
    "contractNo",
    "gstState",
  ];

  const filterOptions = [
    {
      value: "all",
      label: "All",
      field: null,
    },
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
      title="Job Order"
      data={records}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Job Orders found"
      loadingMessage="Loading Job Orders..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="JobOrders"
    />
  );
};

export default JobOrderList;