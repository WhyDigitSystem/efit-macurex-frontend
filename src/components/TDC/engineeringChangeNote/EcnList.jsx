import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import engineeringChangeNoteAPI from "../../../api/TDC/engineeringChangeNoteAPI";
import { toast } from "../../../utils/toast";

const EcnList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await engineeringChangeNoteAPI.getEcnByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load engineering change notes:", error);
      setRecords([]);
      toast.error("Failed to fetch Engineering Change Notes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "ecnNo",
      label: "ECN No",
      accessor: (row) => row.ecnNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "ecnDate",
      label: "Date",
      accessor: (row) => row.ecnDate,
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: (row) =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.id
          : row.plantName || row.plantId,
      type: "text",
    },
    {
      key: "fromDepartment",
      label: "From Department",
      accessor: (row) =>
        typeof row.fromDepartment === "object"
          ? row.fromDepartment.departmentName || row.fromDepartment.id
          : row.fromDepartment,
      type: "text",
    },
    {
      key: "productName",
      label: "Product Name",
      accessor: (row) => row.productName,
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: (row) => row.customerName,
      type: "text",
    },
    {
      key: "productNo",
      label: "Product No",
      accessor: (row) => row.productNo,
      type: "text",
    },
    {
      key: "customerPartNo",
      label: "Customer Part No",
      accessor: (row) => row.customerPartNo,
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
    "ecnNo",
    "ecnDate",
    "plantId",
    "plantId.branchName",
    "plantName",
    "fromDepartment",
    "fromDepartment.departmentName",
    "productName",
    "customerName",
    "productNo",
    "customerPartNo",
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
      title="Engineering Change Note (ECN)"
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
      emptyMessage="No Engineering Change Notes found"
      loadingMessage="Loading Engineering Change Notes..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="EngineeringChangeNotes"
    />
  );
};

export default EcnList;
