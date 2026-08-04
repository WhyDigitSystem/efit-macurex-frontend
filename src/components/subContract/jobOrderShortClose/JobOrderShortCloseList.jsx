import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import jobOrderShortCloseAPI from "../../../api/jobOrderShortCloseAPI";
import { toast } from "../../../utils/toast";

const JobOrderShortCloseList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await jobOrderShortCloseAPI.getJobOrderShortCloseByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load job order short closes:", error);
      setRecords([]);
      toast.error("Failed to fetch Job Order Short Closes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "shortCloseNo",
      label: "Short Close No",
      accessor: "shortCloseNo",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
    },
    {
      key: "customerId",
      label: "Customer Id",
      accessor: "customerId",
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: "customerName",
      type: "text",
    },
    {
      key: "jobOrderNo",
      label: "Job Order No",
      accessor: "jobOrderNo",
      type: "text",
    },
    {
      key: "grnNo",
      label: "GRN No",
      accessor: "grnNo",
      type: "text",
    },
    {
      key: "referenceForSC",
      label: "Reference For SC",
      accessor: "referenceForSC",
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
    "shortCloseNo",
    "date",
    "customerId",
    "customerName",
    "jobOrderNo",
    "grnNo",
    "referenceForSC",
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
      title="Job Order Short Close"
      data={records}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Job Order Short Closes found"
      loadingMessage="Loading Job Order Short Closes..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="JobOrderShortCloses"
    />
  );
};

export default JobOrderShortCloseList;