import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import transferOrderAPI from "../../../api/PPC/transferOrderAPI";
import { useToast } from "../../Toast/ToastContext";

const TransferOrderList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadOrders = useCallback(async () => {
    if (!ORG_ID) {
      setOrderData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const list = await transferOrderAPI.getByOrgId(ORG_ID);

      const sorted = (list || []).sort(
        (a, b) => Number(b.id || 0) - Number(a.id || 0)
      );

      setOrderData(sorted);
    } catch (error) {
      console.error("Failed to load transfer orders:", error);
      addToast("Failed to fetch Transfer Orders", "error");
      setOrderData([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, addToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, refreshTrigger]);

  const columns = [
    {
      key: "docId",
      label: "Document No",
      accessor: (row) => row.docId || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "orderType",
      label: "Order Type",
      accessor: (row) =>
        row.orderType?.description || row.orderType?.code || "-",
      type: "text",
    },
    {
      key: "docDate",
      label: "Date",
      accessor: (row) => row.docDate || "-",
      type: "date",
    },
    {
      key: "financialYear",
      label: "Financial Year",
      accessor: (row) => row.financialYear || "-",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) => (row.active ? "Active" : "Inactive"),
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

  const searchFields = ["docId", "orderType.description"];

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
      title="Transfer Orders"
      data={orderData}
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
      emptyMessage="No Transfer Orders found"
      loadingMessage="Loading Transfer Orders..."
      enableRefresh={true}
      onRefresh={loadOrders}
      enableExport={true}
      exportFileName="TransferOrders"
    />
  );
};

export default TransferOrderList;