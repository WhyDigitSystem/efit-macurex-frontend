import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

import branchAPI from "../../../api/branchAPI";
import engineeringChangeNoteAPI from "../../../api/TDC/engineeringChangeNoteAPI";
import { useToast } from "../../Toast/ToastContext";

const EcnList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const { addToast } = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branchMap, setBranchMap] = useState({});

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  /* Real DTO stores "branch" as a plain numeric id, so resolve names once
     for display rather than showing the raw id in the list. */
  const loadBranches = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branches ||
          response?.paramObjectsMap?.branchVO ||
          [];

      const map = {};
      list.forEach((branch) => {
        map[branch.id] =
          branch.branchName ||
          branch.name ||
          branch.branchCode ||
          `Branch ${branch.id}`;
      });

      setBranchMap(map);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchMap({});
    }
  }, [ORG_ID]);

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);

      const data = await engineeringChangeNoteAPI.getEcnByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => (b.id || 0) - (a.id || 0));

      setRecords(list);
    } catch (error) {
      console.error("Failed to load engineering change notes:", error);
      setRecords([]);
      addToast("Failed to fetch Engineering Change Notes", "error");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "docId",
      label: "ECN No",
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
      key: "branch",
      label: "Plant",
      accessor: (row) => row.branch?.branchName || "",
      type: "text",
    },
    {
      key: "fromDepartment",
      label: "From Department",
      accessor: (row) => row.fromDepartment,
      type: "text",
    },
    {
      key: "partNo",
      label: "Part No",
      accessor: (row) => row.partNo,
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
    "docId",
    "docDate",
    "fromDepartment",
    "partNo",
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
      title="Engineering Change Note"
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
