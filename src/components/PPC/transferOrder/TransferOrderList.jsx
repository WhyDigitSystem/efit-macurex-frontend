import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import transferOrderAPI from "../../../api/PPC/transferOrderAPI";
import { toast } from "../../../utils/toast";

const TransferOrderList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      const orders = await transferOrderAPI.getByOrgId(ORG_ID);

      orders.sort((a, b) => (b.id || 0) - (a.id || 0));

      setOrderData(orders);
    } catch (error) {
      console.error("Failed to load transfer orders:", error);
      setOrderData([]);
      toast.error("Failed to fetch Transfer Orders");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, refreshTrigger]);

  const columns = [
    {
      key: "documentNo",
      label: "Document No",
      accessor: (row) => row.documentNo,
      type: "text",
    },
    {
      key: "orderType",
      label: "Order Type",
      accessor: (row) => row.orderType,
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.date,
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

  const searchFields = ["documentNo", "orderType", "date"];

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