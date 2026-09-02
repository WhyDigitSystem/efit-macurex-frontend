import { useCallback, useEffect, useState } from "react";
import physicalStockReconciliationAPI from "../../../api/Inventory/physicalStockReconciliationAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const PhysicalStockReconciliationList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [reconciliationData, setReconciliationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const loadReconciliations = useCallback(async () => {
    try {
      setLoading(true);

      if (!ORG_ID || !BRANCH_ID) {
        setReconciliationData([]);
        toast.error("Organization or Branch is missing");
        return;
      }

      const response =
        await physicalStockReconciliationAPI.getReconciliationByOrgId(
          ORG_ID,
          BRANCH_ID,
        );

      console.log("Physical Stock Reconciliation List:", response);

      const list = Array.isArray(response) ? response : [];

      const sortedData = [...list].sort((a, b) => (b.id || 0) - (a.id || 0));

      setReconciliationData(sortedData);
    } catch (error) {
      console.error("Failed to load physical stock reconciliations:", error);

      setReconciliationData([]);

      toast.error("Failed to fetch physical stock reconciliations");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadReconciliations();
  }, [loadReconciliations, refreshTrigger]);

  /* -------------------------------------------------------------------------- */
  /* Columns - payload is FLAT, not header/summary nested                       */
  /* -------------------------------------------------------------------------- */

  const columns = [
    {
      key: "docId",
      label: "Doc No.",
      accessor: "docId",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Doc. Date",
      accessor: "docDate",
      type: "date",
    },
    {
      key: "refNo",
      label: "Ref. No",
      accessor: "refNo",
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },
    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: "preparedBy",
      type: "text",
    },
    {
      key: "approvedByPM",
      label: "Approved By PM",
      accessor: "approvedByPM",
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

  const searchFields = ["docId", "refNo", "belongsTo", "preparedBy"];

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
      filterValue: "Active",
      activeValue: "Active",
    },

    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "Inactive",
      activeValue: "Inactive",
    },
  ];

  return (
    <CommonListViewTable
      title="Physical Stock Re-Conciliation"
      data={reconciliationData}
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
      emptyMessage="No Physical Stock Reconciliations found"
      loadingMessage="Loading Physical Stock Reconciliations..."
      enableRefresh={true}
      onRefresh={loadReconciliations}
      enableExport={true}
      exportFileName="PhysicalStockReconciliations"
    />
  );
};

export default PhysicalStockReconciliationList;
