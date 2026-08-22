import React, { useState, useEffect, useCallback, useMemo } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";
import reconcileConsumptionStockAPI from "../../../api/Production/reconcileConsumptionStockAPI";

const ReconcileConsumptionStockList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  // Define columns
  const columns = [
    {
      key: "docId",
      label: "Doc.ID",
      accessor: (row) => row.docId,
      type: "text",
    },
    {
      key: "reconcileDate",
      label: "Reconcile Date",
      accessor: (row) => row.reconcileDate,
      type: "date",
    },
    {
      key: "plant",
      label: "Plant",
      accessor: (row) => row.plant?.name || row.plantName,
      type: "text",
    },
    {
      key: "shopFloor",
      label: "Shop Floor",
      accessor: (row) => row.shopFloor?.name || row.shopFloorName,
      type: "text",
    },
    {
      key: "fgItem",
      label: "FG Item",
      accessor: (row) => row.fgItem?.itemCode || row.fgItemCode,
      type: "text",
    },
    {
      key: "totalValue",
      label: "Total Value",
      accessor: (row) => row.totalValue,
      type: "number",
    },
    { key: "active", label: "Status", accessor: "active", type: "status" },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  const searchFields = ["docId", "plant.plantName", "shopFloor.name", "fgItem.itemCode"];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reconcileConsumptionStockAPI.getReconcileConsumptionByOrgId(ORG_ID, BRANCH_ID);
      const list = response?.paramObjectsMap?.reconcileList || [];
      const sortedData = list.sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sortedData);
    } catch (error) {
      console.error("Failed to load data:", error);
      setData([]);
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

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