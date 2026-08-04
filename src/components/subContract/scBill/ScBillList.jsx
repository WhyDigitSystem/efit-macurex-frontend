import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import scBillAPI from "../../../api/scBillAPI";
import { toast } from "../../../utils/toast";

const ScBillList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await scBillAPI.getScBillByOrgId(ORG_ID, BRANCH_ID);
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load S.C. bills:", error);
      setRecords([]);
      toast.error("Failed to fetch S.C. Bills");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "scBillNo",
      label: "SC Bill No",
      accessor: "scBillNo",
      type: "text",
    },
    {
      key: "scBillDate",
      label: "SC Bill Date",
      accessor: "scBillDate",
      type: "text",
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: "plantName",
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
      key: "vendorInvoiceNo",
      label: "Vendor Invoice No",
      accessor: "vendorInvoiceNo",
      type: "text",
    },
    {
      key: "vendorInvoiceDate",
      label: "Vendor Invoice Date",
      accessor: "vendorInvoiceDate",
      type: "text",
    },
    {
      key: "contractNo",
      label: "Contract No",
      accessor: "contractNo",
      type: "text",
    },
    {
      key: "grnNo",
      label: "GRN No",
      accessor: "grnNo",
      type: "text",
    },
    {
      key: "taxType",
      label: "Tax Type",
      accessor: "taxType",
      type: "text",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: "totalAmount",
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
    "scBillNo",
    "scBillDate",
    "plantName",
    "department",
    "vendorId",
    "vendorName",
    "vendorInvoiceNo",
    "vendorInvoiceDate",
    "contractNo",
    "grnNo",
    "taxType",
    "totalAmount",
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
      title="S.C. Bill"
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
      emptyMessage="No S.C. Bills found"
      loadingMessage="Loading S.C. Bills..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="ScBills"
    />
  );
};

export default ScBillList;
