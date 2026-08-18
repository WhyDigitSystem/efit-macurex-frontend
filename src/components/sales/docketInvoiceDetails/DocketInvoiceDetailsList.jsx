import { useCallback, useEffect, useRef, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import docketInvoiceDetailsAPI from "../../../api/Sales/docketInvoiceDetailsAPI";
import { toast } from "../../../utils/toast";

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  if (value === false || value === "No" || value === "Inactive") return false;
  return value !== false && value !== "Inactive" && value !== "No";
};

const DocketInvoiceDetailsList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = Number(localStorage.getItem("branchId")) || 1000000001;
  const prevRefreshRef = useRef(refreshTrigger);

  const loadData = useCallback(async () => {
    if (!ORG_ID || !BRANCH) {
      console.warn("Missing orgId or branchId");
      return;
    }

    setLoading(true);
    try {
      const response = await docketInvoiceDetailsAPI.getAll(ORG_ID, BRANCH);
      console.log("Docket Invoice List Response:", response);

      // Transform the API response to match the table structure
      const transformedData = (response || []).map((item) => ({
        id: item.id,
        docNo: item.docNo || `DK/${item.id}`,
        docDate: item.docDate || "",
        transportId: item.transport?.id || "",
        transportName: item.transport?.transportName || "",
        branchId: item.branch?.id || "",
        branchName: item.branch?.branchName || "",
        billNo: item.billNo || "",
        billDate: item.billDate || "",
        totalAmount: item.totalAmount || 0,
        orgId: item.orgId || ORG_ID,
        active: normalizeActive(item.active),
        createdBy: item.createdBy || "",
        cancelRemarks: item.cancelRemarks || "",
        docketDetails: (item.docketInvoiceDetResponseDTO || []).map((d) => ({
          docketNo: d.docketNo || "",
          docketDate: d.docketDate || "",
          invoiceNo: d.invoiceNo || "",
          qtyBoxes: d.noOfQty || 0,
          weightBoxes: d.weight || 0,
          totalValue: d.totalValue || 0,
          cumulativeTotal: d.cumulativeValue || 0,
          mode: d.mode || "",
        })),
      }));

      // Sort by id descending (newest first)
      const sorted = transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load Docket/Invoice Details records:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (prevRefreshRef.current !== refreshTrigger) {
      prevRefreshRef.current = refreshTrigger;
      loadData();
    }
  }, [refreshTrigger, loadData]);

  const handleEdit = (row) => {
    // Pass the full row data including docketDetails
    onEdit(row);
  };

  const columns = [
    {
      key: "docNo",
      label: "Doc No",
      accessor: "docNo",
      type: "text",
      noWrap: true
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
      type: "date",
      noWrap: true
    },
    {
      key: "transportName",
      label: "Transport",
      accessor: "transportName",
      type: "text"
    },
    {
      key: "billNo",
      label: "Bill No",
      accessor: "billNo",
      type: "text",
      noWrap: true
    },
    {
      key: "billDate",
      label: "Bill Date",
      accessor: "billDate",
      type: "date",
      noWrap: true
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: "totalAmount",
      type: "text",
      noWrap: true,
      render: (value) => {
        const num = parseFloat(value);

        return (
          <span className="text-gray-900 dark:text-white font-medium">
            {!isNaN(num)
              ? num.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
              : "0.00"}
          </span>
        );
      },
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      render: (value) => {
        const isActive = normalizeActive(value);
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${isActive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px"
    },
  ];

  const searchFields = [
    "docNo",
    "transportName",
    "billNo",
    "branchName"
  ];

  const filterOptions = [
    { value: "all", label: "All" },
    {
      value: "active",
      label: "Active",
      filterFn: (item) => normalizeActive(item.active)
    },
    {
      value: "inactive",
      label: "Inactive",
      filterFn: (item) => !normalizeActive(item.active)
    },
  ];

  return (
    <CommonListViewTable
      title="Docket/Invoice Details"
      subtitle="Manage Docket/Invoice Details"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Docket/Invoice Details records found"
      loadingMessage="Loading Docket/Invoice Details records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="DocketInvoiceDetails"
    />
  );
};

export default DocketInvoiceDetailsList;