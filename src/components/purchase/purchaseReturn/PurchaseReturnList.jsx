import React, { useEffect, useState, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import purchaseReturnAPI from "../../../api/Purchase/purchaseReturn";
import { useToast } from "../../Toast/ToastContext";

const PurchaseReturnList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));
  const { addToast } = useToast();

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return value;
    }
  };

  const loadPurchaseReturns = useCallback(async () => {
    if (!orgId || !branchId) {
      setPurchaseData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const list = await purchaseReturnAPI.getPurchaseReturnByOrgId(
        branchId,
        orgId
      );

      const mapped = (list || []).map((item) => ({
        id: item.id,
        prNo: item.docId || "-",
        supplierName: item.supplier?.customerName || "-",
        supplierCode: item.supplier?.customerCode || "-",
        prDate: formatDate(item.docDate),
        grnNo: item.grnNo || "-",
        grnDate: formatDate(item.grnDate),
        totalAmount: Number(item.totalAmount || 0).toFixed(2),
        totalQty: item.totalQty || 0,
        basicValue: Number(item.basicValue || 0).toFixed(2),
        totalFreight: Number(item.totalFreight || 0).toFixed(2),
        isIgstAppl: item.isIgstAppl || "-",
        active: item.active === "Active" || item.active === true,
        status: item.active === "Active" ? "Active" : "Inactive",
        // store full raw item for edit
        _raw: item,
      }));

      // newest first
      mapped.sort((a, b) => Number(b.id) - Number(a.id));
      setPurchaseData(mapped);
    } catch (err) {
      console.error("Failed to load Purchase Returns:", err);
      addToast("Failed to load Purchase Returns", "error");
      setPurchaseData([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, branchId, addToast]);

  useEffect(() => {
    loadPurchaseReturns();
  }, [loadPurchaseReturns]);

  useEffect(() => {
    if (refreshTrigger) loadPurchaseReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const handleEdit = (purchase) => {
    onEdit(purchase._raw || purchase);
  };

  const columns = [
    {
      key: "prNo",
      label: "PR No",
      accessor: "prNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: "supplierName",
      type: "text",
    },
    {
      key: "prDate",
      label: "PR Date",
      accessor: "prDate",
      type: "text",
      noWrap: true,
    },
    {
      key: "grnNo",
      label: "GRN No",
      accessor: "grnNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "totalQty",
      label: "Total Qty",
      accessor: "totalQty",
      type: "text",
      align: "right",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: "totalAmount",
      type: "text",
      align: "right",
    },
    {
      key: "isIgstAppl",
      label: "IGST Appl",
      accessor: "isIgstAppl",
      type: "text",
    },
    {
      key: "status",
      label: "Status",
      accessor: "status",
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

  const searchFields = ["prNo", "supplierName", "grnNo", "supplierCode"];

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

  const handleDownload = () => {
    addToast("Purchase Return PDF download coming soon", "info");
  };

  return (
    <CommonListViewTable
      title="Purchase Return"
      subtitle="Manage Purchase Returns"
      data={purchaseData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onDownload={handleDownload}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Purchase Returns found"
      loadingMessage="Loading Purchase Returns..."
      enableRefresh={true}
      onRefresh={loadPurchaseReturns}
      enableExport={true}
      exportFileName="Purchase_Returns"
    />
  );
};

export default PurchaseReturnList;