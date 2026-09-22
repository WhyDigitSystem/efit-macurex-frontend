import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import reconcileConsumptionStockAPI from "../../../api/Production/reconcileConsumptionStockAPI";
import { toast } from "../../../utils/toast";

const ReconcileConsumptionStockList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const loadData = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      setData([]);
      return;
    }

    try {
      setLoading(true);

      const list = await reconcileConsumptionStockAPI.getByOrgIdAndBranch({
        orgId: ORG_ID,
        branch: BRANCH_ID,
      });

      const sortedData = (list || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setData(sortedData);
    } catch (error) {
      console.error("Failed to load reconcile records:", error);
      setData([]);
      toast.error("Failed to fetch reconcile records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  /* ---------------- Accessors ---------------- */

  const getPlantLabel = (row) =>
    row?.branch?.branchName ||
    row?.branch?.branchCode ||
    row?.branch?.id ||
    "";

  const getShopFloorLabel = (row) =>
    row?.shopFloor?.locationName || row?.shopFloor?.id || "";

  const getFgItemLabel = (row) =>
    row?.fgItem?.itemCode ||
    row?.fgItem?.itemDescription ||
    row?.fgItem?.id ||
    "";

  const getRmLocationLabel = (row) =>
    row?.rmLocation?.locationName || row?.rmLocation?.id || "";

  const getTotalValue = (row) =>
    (row?.details || []).reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  /* ---------------- Columns ---------------- */

  const columns = [
    {
      key: "docId",
      label: "Doc.ID",
      accessor: (row) => row?.docId || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: (row) => row?.docDate || "",
      type: "text",
    },
    {
      key: "reconcileDate",
      label: "Reconcile Date",
      accessor: (row) => row?.reconcileDate || "",
      type: "text",
    },
    {
      key: "branch",
      label: "Plant",
      accessor: (row) => getPlantLabel(row),
      type: "text",
    },
    {
      key: "shopFloor",
      label: "Shop Floor",
      accessor: (row) => getShopFloorLabel(row),
      type: "text",
    },
    {
      key: "fgItem",
      label: "FG Item",
      accessor: (row) => getFgItemLabel(row),
      type: "text",
    },
    {
      key: "rmLocation",
      label: "RM Location",
      accessor: (row) => getRmLocationLabel(row),
      type: "text",
    },
    {
      key: "totalValue",
      label: "Total Value",
      accessor: (row) => getTotalValue(row),
      type: "number",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) =>
        row?.active === true || row?.active === "Active"
          ? "Active"
          : "Inactive",
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
    "branch.branchName",
    "shopFloor.locationName",
    "fgItem.itemCode",
    "rmLocation.locationName",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Reconcile Consumption Stock"
        data={data}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={onEdit}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage="No reconcile records found"
        loadingMessage="Loading reconcile records..."
        enableRefresh={true}
        onRefresh={loadData}
        enableExport={true}
        exportFileName="ReconcileConsumptionStock"
      />
    </div>
  );
};

export default ReconcileConsumptionStockList;