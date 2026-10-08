import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import fgTransferSlipAPI from "../../../api/Production/fgTransferSlipAPI";
import { useToast } from "../../Toast/ToastContext";

const FGTransferSlipList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [transferData, setTransferData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  const loadTransferSlips = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      setTransferData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const list = await fgTransferSlipAPI.getFGTransferSlipByOrgId(
        BRANCH_ID,
        ORG_ID
      );

      const sorted = (list || []).sort(
        (a, b) => Number(b.id || 0) - Number(a.id || 0)
      );

      setTransferData(sorted);
    } catch (error) {
      console.error("Failed to load FG transfer slips:", error);
      addToast("Failed to fetch FG transfer slips", "error");
      setTransferData([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  useEffect(() => {
    loadTransferSlips();
  }, [loadTransferSlips, refreshTrigger]);

  const columns = [
    {
      key: "transferNo",
      label: "Transfer No",
      accessor: (row) => row.transferNo || row.docId || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "transferDate",
      label: "Transfer Date",
      accessor: (row) => row.transferDate || row.docDate || "-",
      type: "date",
    },
    {
      key: "branchName",
      label: "Plant",
      accessor: (row) => row.branch?.branchName || "-",
      type: "text",
    },
    {
      key: "fromLocation",
      label: "From Location",
      accessor: (row) => row.fromLocation?.locationName || "-",
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: (row) => row.toLocation?.locationName || "-",
      type: "text",
    },
    {
      key: "fgItemCode",
      label: "FG Item",
      accessor: (row) =>
        row.fgItem?.itemCode
          ? `${row.fgItem.itemCode} - ${row.fgItem.itemDescription || ""}`
          : "-",
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer",
      accessor: (row) => row.customer?.customerName || "-",
      type: "text",
    },
    {
      key: "scheduledQty",
      label: "Scheduled Qty",
      accessor: (row) => row.scheduledQty ?? "-",
      type: "text",
      align: "right",
    },
    {
      key: "totalQty",
      label: "Total Qty",
      accessor: (row) => row.totalQty ?? "-",
      type: "text",
      align: "right",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) =>
        row.active === "Active" || row.active === true ? "Active" : "Inactive",
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

  const searchFields = ["transferNo", "fgItem.itemCode", "scheduleNo"];

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
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="FG Transfer Slip"
        data={transferData}
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
        emptyMessage="No FG Transfer Slips found"
        loadingMessage="Loading FG Transfer Slips..."
        enableRefresh={true}
        onRefresh={loadTransferSlips}
        enableExport={true}
        exportFileName="FGTransferSlips"
      />
    </div>
  );
};

export default FGTransferSlipList;