import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import excelPurchaseOrderAPI from "../../../api/Purchase/excelPurchaseOrderAPI";
import { toast } from "../../../utils/toast";

const ExcelPurchaseOrderList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      const orders = await excelPurchaseOrderAPI.getByOrgId(ORG_ID);

      orders.sort((a, b) => (b.id || 0) - (a.id || 0));

      setOrderData(orders);
    } catch (error) {
      console.error("Failed to load excel purchase orders:", error);
      setOrderData([]);
      toast.error("Failed to fetch Excel Purchase Orders");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, refreshTrigger]);

  const columns = [
    {
      key: "poNo",
      label: "P.O. No",
      accessor: (row) => row.header?.poNo || row.poNo,
      type: "text",
    },
    {
      key: "poDate",
      label: "P.O. Date",
      accessor: (row) => row.header?.poDate || row.poDate,
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant ID",
      accessor: (row) => row.header?.plantId || row.plantId,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.header?.department || row.department,
      type: "text",
    },
    {
      key: "supplierCode",
      label: "Supplier ID",
      accessor: (row) => row.header?.supplierCode || row.supplierCode,
      type: "text",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: (row) => row.header?.supplierName || row.supplierName,
      type: "text",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: (row) => row.terms?.totalAmount || row.totalAmount,
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
    "header.poNo",
    "poNo",
    "header.supplierCode",
    "supplierCode",
    "header.supplierName",
    "supplierName",
    "header.department",
    "department",
  ];

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
      title="Excel Purchase Order"
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
      emptyMessage="No Excel Purchase Orders found"
      loadingMessage="Loading Excel Purchase Orders..."
      enableRefresh={true}
      onRefresh={loadOrders}
      enableExport={true}
      exportFileName="ExcelPurchaseOrders"
    />
  );
};

export default ExcelPurchaseOrderList;