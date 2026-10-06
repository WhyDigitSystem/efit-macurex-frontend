import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import stockTransferGrnAPI from "../../../api/Inventory/stockTransferGRNAPI";
import { toast } from "../../../utils/toast";

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const idOf = (value) =>
  value && typeof value === "object" ? (value.id ?? "") : (value ?? "");

/* API row -> flat row used by the table */
const toListRow = (r) => ({
  ...r,
  grnNo: r.docId || "",
  grnDate: r.docDate || "",
  supplierName: r.supplierCode?.supplierName || "",
  branchName: r.branch?.branchName || "",
  active: normalizeActive(r.active),
});

/* API row -> shape expected by StockTransferGRNForm (edit mode) */
const toFormData = (r) => ({
  id: r.id,
  active: normalizeActive(r.active),

  branch: String(idOf(r.branch)),
  grnNo: r.docId || "",
  grnDate: r.docDate || "",
  belongsTo: r.belongsTo || "",
  location: idOf(r.location),

  supplierCode: idOf(r.supplierCode),
  supplierName: r.supplierCode?.supplierName || "",
  address: r.supplierCode?.address || "",
  gstState: r.supplierCode?.gstSate || r.supplierCode?.gstState || "",
  gstinNo: r.supplierCode?.gstNo || "",

  isIgstApplicable: r.isIgstApplicable || "No",
  isReverseCharge: r.isReverseCharge || "No",
  gatePassNo: r.gatePassNo || "",
  poNo: r.poNo || "",
  dealerType: r.dealerType || "",
  scheduleNo: r.scheduleNo || "",
  scheduleDate: r.scheduleDate || "",
  schStartDate: r.scheduleStartDate || "",
  schEndDate: r.scheduleEndDate || "",

  currency: idOf(r.currency),
  exchangeRate: r.exchangeRate ?? 1,
  grnClearTime: (r.grnClearTime || "").slice(0, 5),

  grossAmount: r.grossAmount ?? 0,
  discountPerc: r.discount ?? 0,
  netAmount: r.netAmount ?? 0,
  basicAmount: r.basicAmount ?? 0,
  totalAmountTax: r.totalAmountTax ?? 0,
  totalQtyKg: r.totalQtyInKg ?? 0,

  modvatCopyReceived: r.modvatCopyReceived || "No",
  partyDcNo: r.partyDcNo || "",
  supplierDcDate: r.supplierDcDate || "",
  invoiceSentOn: r.invoiceSentOn || "",
  remarks: r.remarks || "",
  cancelRemarks: r.cancelRemarks || "",
  financialYear: r.financialYear || String(new Date().getFullYear()),
  createdBy: r.createdBy,

  stockTransferGrnDetailsDTO: (r.stockTransferGrnDetailsResponseDTO || []).map(
    (d) => ({
      id: d.id || 0,

      item: idOf(d.item),
      itemCode: d.item?.itemCode || "",
      itemDescription: d.item?.itemDescription || "",

      primaryUnit: idOf(d.item?.primaryUnit),
      stock: Number(d.stock) > 0,
      purchaseTolerance: d.purchaseTolerance ?? "",
      inspectionable: d.inspectionable === "Yes",

      poRate: d.poRate ?? "",
      poQty: d.poQty ?? "",
      poUnit: idOf(d.poUnit),

      challanQty: d.challanQty ?? "",
      storeStock: d.storeStock ?? "",
      pendingQty: d.pendingQty ?? "",

      receivedQty: d.receivedQty ?? "",
      receivedUnit: idOf(d.receivedUnit),
      conversionFactor: d.conversionFactor ?? 1,
      recQtyInPrimaryUnit: d.recQtyInPrimaryUnit ?? "",

      acceptQty: d.acceptQty ?? "",
      accQtyInPrimaryUnit: d.accQtyInPrimaryUnit ?? "",
      accUnit: idOf(d.accUnit),

      rejectQty: d.rejectQty ?? "",
      rejQtyInPrimaryUnit: d.rejQtyInPrimaryUnit ?? "",

      excessQty: d.excessQty ?? "",

      amount: d.amount ?? "",
      apportionedCost: d.apportionedCost ?? "",
      insurance: d.insurance ?? "",
      handCharge: d.handCharge ?? "",
      lcost: d.lcost ?? "",
      landedCostRate: d.landedCostRate ?? "",
      landedValue: d.landedValue ?? "",

      itemMaxQty: d.itemMaxQty ?? 0,
      bankchrg: d.bankchrg ?? 0,
      taxPercentage: d.taxPercentage ?? "",
    }),
  ),

  /* NOTE: attachment field names are a guess - adjust to your API */
  attachments: (r.stockTransferGrnFileUploadDetailsResponseDTO || []).map(
    (f) => ({
      name: f.fileName || f.name || "",
      file: null,
      filePath: f.filePath || f.path || "",
      remarks: f.remarks || "",
      isExisting: true,
    }),
  ),
});

const StockTransferGRNList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = Number(localStorage.getItem("branchId")) || 1000000001;

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const res = await stockTransferGrnAPI.getStockTransferGrnByOrgId(
        ORG_ID,
        BRANCH,
      );

      const list =
        res?.paramObjectsMap?.stockTransferGrnVO ||
        res?.paramObjectsMap?.mapp ||
        res?.paramObjectsMap?.stockTransferGrnMasterList ||
        [];

      const rows = (Array.isArray(list) ? list : [])
        .map(toListRow)
        .sort((a, b) => (b.id || 0) - (a.id || 0));

      setData(rows);
    } catch (error) {
      console.error("Failed to load Stock Transfer GRN records:", error);
      setData([]);
      toast.error("Failed to fetch Stock Transfer GRN records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    {
      key: "grnNo",
      label: "GRN No",
      accessor: "grnNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "grnDate",
      label: "GRN Date",
      accessor: "grnDate",
      type: "text",
      noWrap: true,
    },
    {
      key: "supplierName",
      label: "Supplier",
      accessor: "supplierName",
      type: "text",
    },
    { key: "branchName", label: "Plant", accessor: "branchName", type: "text" },
    {
      key: "gatePassNo",
      label: "Gate Pass",
      accessor: "gatePassNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "poNo",
      label: "PO/PC No",
      accessor: "poNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      render: (value) => {
        const isActive = normalizeActive(value);
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
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
      width: "90px",
    },
  ];

  const searchFields = ["grnNo", "supplierName", "gatePassNo", "poNo"];

  const filterOptions = [
    { value: "all", label: "All" },
    {
      value: "active",
      label: "Active",
      filterFn: (item) => normalizeActive(item.active),
    },
    {
      value: "inactive",
      label: "Inactive",
      filterFn: (item) => !normalizeActive(item.active),
    },
  ];

  return (
    <CommonListViewTable
      title="Stock Transfer GRN"
      subtitle="Manage Stock Transfer Goods Receipt Notes"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={(row) => onEdit(toFormData(row))}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Stock Transfer GRN records found"
      loadingMessage="Loading Stock Transfer GRN records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="StockTransferGRN"
    />
  );
};

export default StockTransferGRNList;
