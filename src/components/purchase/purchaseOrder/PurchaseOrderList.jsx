import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const PurchaseOrderList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [poData, setPoData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);

      const response = await purchaseOrderAPI.getPurchaseOrderByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setPoData(sortedData);
    } catch (error) {
      console.error("Failed to load purchase orders:", error);
      setPoData([]);
      toast.error("Failed to fetch purchase orders");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadPurchaseOrders();
  }, [loadPurchaseOrders, refreshTrigger]);

  // P.O.No / P.O.Date / Supplier live under localHeader for Local POs and
  // importHeader for Import POs — accessor falls back across both so a
  // single column works for either record type.
  const columns = [
    {
      key: "pType",
      label: "P.Type",
      accessor: (row) => row.commonHeader?.pType,
      type: "badge",
    },
    {
      key: "poNo",
      label: "P.O.No",
      accessor: (row) => row.localHeader?.poNo || row.importHeader?.poNo,
      type: "text",
    },
    {
      key: "poDate",
      label: "P.O.Date",
      accessor: (row) => row.localHeader?.poDate || row.importHeader?.poDate,
      type: "date",
    },
    {
      key: "plant",
      label: "Plant ID",
      accessor: (row) => row.commonHeader?.plant,
      type: "text",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: (row) =>
        row.localHeader?.supplierName || row.importHeader?.supplierName,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.localHeader?.department,
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
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
    "localHeader.poNo",
    "importHeader.poNo",
    "localHeader.supplierName",
    "importHeader.supplierName",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Purchase Order"
        data={poData}
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
        emptyMessage="No Purchase Orders found"
        loadingMessage="Loading Purchase Orders..."
        enableRefresh={true}
        onRefresh={loadPurchaseOrders}
        enableExport={true}
        exportFileName="PurchaseOrders"
      />
    </div>
  );
};

export default PurchaseOrderList;
