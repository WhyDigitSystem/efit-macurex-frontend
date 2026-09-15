import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

import branchAPI from "../../../api/branchAPI";
import materialIndentForProductionAPI from "../../../api/Production/materialIndentForProductionAPI";
import { useToast } from "../../Toast/ToastContext";

const MaterialIndentForProductionList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const { addToast } = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branchMap, setBranchMap] = useState({});

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  /* plant comes back as a numeric id, so resolve names once for display. */
  const loadBranches = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branchVO ||
          response?.paramObjectsMap?.branches ||
          [];

      const map = {};
      list.forEach((b) => {
        map[b.id] = b.branchName || b.branchCode || `Branch ${b.id}`;
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

      const data =
        await materialIndentForProductionAPI.getMaterialIndentsByOrgId(
          ORG_ID,
          BRANCH_ID,
        );

      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => (b.id || 0) - (a.id || 0));

      setRecords(list);
    } catch (error) {
      console.error("Failed to load material indents:", error);
      setRecords([]);
      addToast("Failed to fetch Material Indents", "error");
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
      key: "indentNo",
      label: "Indent No.",
      accessor: (row) => row.indentNo || row.docId,
      type: "text",
      noWrap: true,
    },
    {
      key: "indentDate",
      label: "Indent Date",
      accessor: (row) => row.indentDate || row.docDate,
      type: "text",
      noWrap: true,
    },
    {
      key: "plant",
      label: "Plant",
      accessor: (row) =>
        row.branch?.branchName ||
        branchMap[row.branch?.id ?? row.branch] ||
        row.branch,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) =>
        row.department?.departmentName ||
        row.department?.departmentCode ||
        row.department,
      type: "text",
    },

    {
      key: "fgItemCode",
      label: "FG/SFG Item Code",
      accessor: (row) => row.fgItem?.itemCode || row.fgItemCode,
      type: "text",
    },
    {
      key: "itemDescription",
      label: "Item Description",
      accessor: (row) => row.itemDescription || row.fgItem?.itemDescription,
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: (row) => row.belongsTo,
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
    "branch.branchName",
    "department.departmentName",
    "department.departmentCode",
    "schOrderNo",
    "fgItem.itemCode",
    "fgItem.itemDescription",
    "itemDescription",
    "belongsTo",
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
      title="Material Indent For Production"
      subtitle="Manage Material Indents"
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
      emptyMessage="No Material Indents found"
      loadingMessage="Loading Material Indents..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="MaterialIndents"
    />
  );
};

export default MaterialIndentForProductionList;
