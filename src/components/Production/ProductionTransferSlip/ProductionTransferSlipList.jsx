import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

import branchAPI from "../../../api/branchAPI";
import productionTransferSlipAPI from "../../../api/Production/productionTransferSlipAPI";
import { useToast } from "../../Toast/ToastContext";

const ProductionTransferSlipList = ({
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

  // ============================================================
  // LOAD BRANCHES
  // ============================================================

  const loadBranches = useCallback(async () => {
    try {
      if (!ORG_ID) {
        return;
      }

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branchVO ||
          response?.paramObjectsMap?.branches ||
          [];

      const map = {};

      list.forEach((branch) => {
        if (!branch?.id) {
          return;
        }

        map[branch.id] =
          branch.branchName || branch.branchCode || `Branch ${branch.id}`;
      });

      setBranchMap(map);
    } catch (error) {
      console.error("Failed to load branches:", error);

      setBranchMap({});
    }
  }, [ORG_ID]);

  // ============================================================
  // LOAD PRODUCTION TRANSFER SLIPS
  // ============================================================

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);

      if (!ORG_ID || !BRANCH_ID) {
        setRecords([]);

        addToast("Organization or Branch is missing", "error");

        return;
      }

      /*
       * IMPORTANT:
       *
       * API method:
       * getByOrgId(branch, orgId)
       *
       * Swagger:
       * branch = 1000000016
       * orgId  = 1000000017
       */

      const data = await productionTransferSlipAPI.getByOrgId(
        BRANCH_ID,
        ORG_ID,
      );

      console.log("Production Transfer Slip List:", data);

      const list = Array.isArray(data) ? data : [];

      const sortedList = [...list].sort(
        (a, b) => (Number(b?.id) || 0) - (Number(a?.id) || 0),
      );

      setRecords(sortedList);
    } catch (error) {
      console.error("Failed to load production transfer slips:", error);

      setRecords([]);

      addToast("Failed to fetch Production Transfer Slips", "error");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  // ============================================================
  // TABLE COLUMNS
  // ============================================================

  const columns = [
    {
      key: "issueNo",
      label: "Issue No.",
      accessor: (row) => row?.docId || row?.issueNo || row?.transferNo || "",
      type: "text",
      noWrap: true,
    },

    {
      key: "issueDate",
      label: "Issue Date",
      accessor: (row) => row?.docDate || row?.issueDate || row?.date || "",
      type: "text",
      noWrap: true,
    },

    {
      key: "plant",
      label: "Plant",
      accessor: (row) => {
        if (row?.branch?.branchName) {
          return row.branch.branchName;
        }

        if (row?.plant?.plantName) {
          return row.plant.plantName;
        }

        const branchId =
          row?.branch?.id ??
          row?.branch ??
          row?.plant?.id ??
          row?.plant ??
          row?.branchId ??
          row?.plantId;

        return branchMap[branchId] || branchId || "";
      },
      type: "text",
    },

    {
      key: "fgPartNo",
      label: "FG Part No.",
      accessor: (row) => row?.fgPartNo?.itemCode || "",
      type: "text",
    },

    {
      key: "sfgPartNo",
      label: "SFG Part No",
      accessor: (row) => row?.sfgPartNo?.itemCode || "",
      type: "text",
    },

    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: (row) => row?.belongsTo || "",
      type: "text",
    },

    {
      key: "issueQty",
      label: "Issue Qty",
      accessor: (row) => row?.issueQty ?? "",
      type: "text",
      noWrap: true,
    },

    {
      key: "totalValue",
      label: "Total Value",
      accessor: (row) => row?.totalValue ?? "",
      type: "text",
      noWrap: true,
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

  // ============================================================
  // SEARCH FIELDS
  // ============================================================

  const searchFields = [
    "docId",
    "issueNo",
    "docDate",
    "issueDate",

    "branch.branchName",
    "branch.branchCode",

    "plant.plantName",

    "fgItem.itemCode",
    "fgPartNo",
    "fgItemCode",

    "sfgItem.itemCode",
    "sfgPartNo",
    "sfgItemCode",

    "belongsTo",
  ];

  // ============================================================
  // FILTER
  // ============================================================

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

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <CommonListViewTable
      title="Production Transfer Slip"
      subtitle="Manage Production Transfer Slips"
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
      emptyMessage="No Production Transfer Slips found"
      loadingMessage="Loading Production Transfer Slips..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="ProductionTransferSlips"
    />
  );
};

export default ProductionTransferSlipList;
