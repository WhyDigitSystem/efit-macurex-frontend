import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import salesOrderShortCloseAPI from "../../../api/Sales/salesOrderShortCloseAPI";
import { toast } from "../../../utils/toast";

const SalesOrderShortCloseList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await salesOrderShortCloseAPI.getSalesOrderShortCloseByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load sales order short-closes:", error);
      setRecords([]);
      toast.error("Failed to fetch Sales Order Short-Closes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "docId",
      label: "Sales Agreement No",
      accessor: (row) => row.docId,
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Date",
      accessor: (row) => row.docDate,
      type: "text",
    },
    {
      key: "customerId",
      label: "Customer",
      accessor: (row) =>
        typeof row.customerId === "object"
          ? row.customerId.customerName ||
            row.customerId.customerCode ||
            row.customerId.id
          : row.customerName || row.customerId,
      type: "text",
    },
    {
      key: "branch",
      label: "Branch",
      accessor: (row) =>
        typeof row.branch === "object"
          ? row.branch.branchName || row.branch.branchCode || row.branch.id
          : row.branch,
      type: "text",
    },
    // {
    //   key: "active",
    //   label: "Status",
    //   accessor: "active",
    //   type: "status",
    //   statusVariants: {
    //     Active: {
    //       label: "Active",
    //       className:
    //         "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    //     },
    //     Inactive: {
    //       label: "Inactive",
    //       className:
    //         "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    //     },
    //   },
    // },
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
    "docDate",
    "customerId",
    "customerId.customerName",
    "customerId.customerCode",
    "customerName",
    "branch",
    "branch.branchName",
    "branch.branchCode",
    "cancelRemarks",
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
      title="Sales Order Short-Close"
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
      emptyMessage="No Sales Order Short-Closes found"
      loadingMessage="Loading Sales Order Short-Closes..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="SalesOrderShortCloses"
    />
  );
};

export default SalesOrderShortCloseList;
