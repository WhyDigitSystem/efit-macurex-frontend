import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import purchaseReturnAPI from "../../../api/Purchase/purchaseReturn";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { useToast } from "../../Toast/ToastContext";

/* ----------------------------- Style Constants ---------------------------- */
const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const cellInput =
  "w-full h-7 px-1.5 rounded border text-[10px] transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";
const errorClass = "text-[10px] text-red-500 mt-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

/* ----------------------------- Static Options ----------------------------- */
const YES_NO_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const BELONGS_TO_OPTIONS = [
  { value: "Appliances", label: "Appliances" },
  { value: "Bosch", label: "Bosch" },
];

const TAX_TYPE_OPTIONS = [
  { value: "SGST", label: "SGST" },
  { value: "IGST", label: "IGST" },
];

const EXCISE_OPTIONS = [
  { value: "No", label: "No" },
  { value: "Yes", label: "Yes" },
];

const LIST_OF_VALUES_GROUPS = {
  PARTICULARS: "Particulars",
};

const SYSTEM_PARTICULARS = ["Gross Amount", "SGST", "CGST", "IGST"];

/* ----------------------------- Utility Functions -------------------------- */
const formatDateForAPI = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
};

const getEmptyRow = () => ({
  itemCode: "",
  itemDescription: "",
  hsnSacCode: "",
  hsnId: "",
  item: "",
  unit: "",
  unitId: "",
  taxType: "",
  taxPercentage: "",
  tariffNo: "",
  exciseToPost: "No",
  challanQty: "",
  grnReceivedQty: "",
  acceptedQty: "",
  rejectedQty: 0,
  shortageQty: 0,
  poRate: "",
  rateInINR: "",
  rateInSelectedCurrency: "",
  apportionedCost: "",
  landedCostRate: "",
  amount: "",
  amountInSelectedCurrency: "",
  additionalDuty: "",
  amountInINR: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
});

const getEmptyTaxRow = () => ({
  particulars: "",
  taxPercentage: "",
  acceptedQtyAmount: "",
  amount: "",
  revisedAmount: "",
  ledgerAccountName: "",
  dbcr: "",
  dbamt: "",
  cramt: "",
  postToFinance: "",
  isSystemRow: false,
});

/* ----------------------------- Field Component ---------------------------- */
const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options = [],
  className = "",
  placeholder = "",
  disabled = false,
  checked = false,
}) => {
  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${controlClasses} ${
            error ? "border-red-500 focus:border-red-500" : ""
          }`}
          disabled={disabled}
        >
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className={errorClass}>{error}</p>}
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className={`w-full ${className}`}>
        <label className={`${labelClasses} select-none`}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <label
          className={`${controlClasses} flex items-center gap-1.5 cursor-pointer h-[30px]`}
        >
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
          />
          <span className="text-gray-700 dark:text-gray-200">{label}</span>
        </label>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`${controlClasses} ${
          error ? "border-red-500 focus:border-red-500" : ""
        }`}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
};

/* ============================= MAIN COMPONENT ============================= */
const PurchaseReturnForm = ({ data, onBack, isEditMode = false }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));
  const [activeTab, setActiveTab] = useState("purchaseDetail");
  const { addToast } = useToast();

  /* ------------------------------ Form State ------------------------------ */
  const [form, setForm] = useState({
    plantId: data?.plantId || "",
    prNo: data?.prNo || "",
    belongsTo: data?.belongsTo || "",
    prDate: data?.prDate || new Date().toISOString().split("T")[0],
    supplierName: data?.supplierName || "",
    supplierId: data?.supplierId || "",
    supplierCode: data?.supplierCode || "",
    gstState: data?.gstState || "",
    gstNo: data?.gstNo || "",
    address: data?.address || "",
    grnNo: data?.grnNo || "",
    grnDate: data?.grnDate || "",
    purchaseBillNo: data?.purchaseBillNo || "",
    purchaseBillDate: data?.purchaseBillDate || "",
    isIGSTAppl: data?.isIGSTAppl || "No",
    excisable: data?.excisable || false,
    currency: data?.currency || "",
    gstnNo: data?.gstnNo || "",
    vendorDCNo: data?.vendorDCNo || "",
    exchangeRate: data?.exchangeRate || "",
    dealerType: data?.dealerType || "",
    taxCode: data?.taxCode || "",
    poNo: data?.poNo || "",
    poType: data?.poType || "",
    isReverseChrg: data?.isReverseChrg || false,
    voucherPostingDate: data?.voucherPostingDate || "",
    dutyPerUnit: data?.dutyPerUnit || "",
    postingCategory: data?.postingCategory || "",
    modvatCopyReceived: data?.modvatCopyReceived || "",
    eccType: data?.eccType || "",
    supplierDCINVNo: data?.supplierDCINVNo || "",
    supplierDCINVDate: data?.supplierDCINVDate || "",
    entryTaxApplicable: data?.entryTaxApplicable || "",
    narration: data?.narration || "",
    paymentTerms: data?.paymentTerms || "",
    basicValue: data?.basicValue || 0,
    totalFreight: data?.totalFreight || 0,
  });

  const [purchaseRows, setPurchaseRows] = useState(
    data?.purchaseReturnDetailsDTO?.length
      ? data.purchaseReturnDetailsDTO.map((r) => ({ ...getEmptyRow(), ...r }))
      : [getEmptyRow()],
  );

  const [chargesRows, setChargesRows] = useState(
    data?.purchaseReturnTaxDetailsDTO?.length
      ? data.purchaseReturnTaxDetailsDTO.map((r) => ({
          ...getEmptyTaxRow(),
          ...r,
        }))
      : [
          {
            ...getEmptyTaxRow(),
            particulars: "Gross Amount",
            amount: 0,
            revisedAmount: 0,
            isSystemRow: true,
          },
        ],
  );

  /* ------------------------------ List State ------------------------------ */
  const [plantData, setPlantData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [grnList, setGrnList] = useState([]);
  const [billList, setBillList] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [listOfValuesData, setListOfValuesData] = useState({});

  const [loadingPlant, setLoadingPlant] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingGrn, setLoadingGrn] = useState(false);
  const [loadingBill, setLoadingBill] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingParticulars, setLoadingParticulars] = useState(false);
  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const isUpdatingRef = useRef(false);

  /* ============================== LOADERS ================================ */
  const loadPlants = useCallback(async () => {
    if (!orgId) return;
    setLoadingPlant(true);
    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      const options = (response || []).map((branch) => ({
        value: branch.id,
        label: branch.branchName,
      }));
      setPlantData(options);
    } catch (err) {
      console.error("Failed to load plants:", err);
      addToast("Failed to load Plant list", "error");
      setPlantData([]);
    } finally {
      setLoadingPlant(false);
    }
  }, [orgId, addToast]);

  const loadSuppliers = useCallback(async () => {
    if (!orgId || !branchId) return;
    setLoadingSuppliers(true);
    try {
      const list = await purchaseReturnAPI.getSupplierDetails(branchId, orgId);
      setSuppliers(list);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      addToast("Failed to load suppliers", "error");
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  }, [branchId, orgId, addToast]);

  const loadListOfValuesData = useCallback(async () => {
    if (!orgId) return;
    setLoadingParticulars(true);
    try {
      const result = {};
      await Promise.all(
        Object.entries(LIST_OF_VALUES_GROUPS).map(async ([key, group]) => {
          try {
            const response = await listOfValuesAPI.getListValuesGroup(
              group,
              orgId,
            );

            let items = [];
            if (response?.paramObjectsMap?.listValues) {
              items = response.paramObjectsMap.listValues;
            } else if (response?.data?.paramObjectsMap?.listValues) {
              items = response.data.paramObjectsMap.listValues;
            } else if (Array.isArray(response)) {
              items = response;
            } else if (response?.listValues) {
              items = response.listValues;
            }

            result[key] = items.map((item) => ({
              value: item.id || item.value,
              label: item.valuesDescription || item.label || item.name,
              ...item,
            }));
          } catch (err) {
            console.error(`${group} failed`, err);
            result[key] = [];
          }
        }),
      );
      setListOfValuesData(result);
    } catch (err) {
      console.error("Error loading ListOfValues:", err);
    } finally {
      setLoadingParticulars(false);
    }
  }, [orgId]);

  const loadGrnList = useCallback(
    async (supplierId) => {
      if (!supplierId || !orgId || !branchId) return [];
      setLoadingGrn(true);
      try {
        const list = await purchaseReturnAPI.getGrnDetails(
          branchId,
          orgId,
          supplierId,
        );
        setGrnList(list);
        return list;
      } catch (err) {
        console.error("Failed to load GRN list:", err);
        addToast("Failed to load GRN list", "error");
        setGrnList([]);
        return [];
      } finally {
        setLoadingGrn(false);
      }
    },
    [branchId, orgId, addToast],
  );

  const loadBills = useCallback(
    async (grnNo, supplierId) => {
      if (!grnNo || !supplierId) return [];
      setLoadingBill(true);
      try {
        const list = await purchaseReturnAPI.getPurchaseBill(
          branchId,
          grnNo,
          orgId,
          supplierId,
        );
        setBillList(list);
        return list;
      } catch (err) {
        console.error("Failed to load purchase bills:", err);
        addToast("Failed to load purchase bills", "error");
        setBillList([]);
        return [];
      } finally {
        setLoadingBill(false);
      }
    },
    [branchId, orgId, addToast],
  );

  const loadBillItems = useCallback(
    async (billNo, grnNo, supplierId) => {
      if (!billNo || !grnNo || !supplierId) return [];
      setLoadingItems(true);
      try {
        const items = await purchaseReturnAPI.getPurchaseBillItemDetails(
          billNo,
          branchId,
          grnNo,
          orgId,
          supplierId,
        );

        const enriched = await Promise.all(
          items.map(async (it) => {
            let tax = { sgst: 0, cgst: 0, igst: 0, taxPercentage: 0 };
            if (it.hsn) {
              try {
                const t = await purchaseReturnAPI.getTaxValue(it.hsn, orgId);
                if (t) tax = t;
              } catch {}
            }
            const rowTaxType =
              form.isIGSTAppl === "Yes"
                ? "IGST"
                : form.isIGSTAppl === "No"
                  ? "SGST"
                  : "";

            return {
              ...getEmptyRow(),
              itemCode: it.itemCode || "",
              itemDescription: it.itemDescription || "",
              hsnSacCode: it.hsn || "",
              hsnId: it.hsnId || "",
              item: it.item || "",
              unit: it.unit || "",
              unitId: it.unitId || "",
              challanQty: it.challanQty || "",
              grnReceivedQty: it.grnReceivedQty || "",
              acceptedQty: it.acceptedQty || "",
              rejectedQty:
                it.rejectedQty !== null && it.rejectedQty !== undefined
                  ? it.rejectedQty
                  : 0,
              shortageQty:
                it.shortageQty !== null && it.shortageQty !== undefined
                  ? it.shortageQty
                  : 0,
              taxPercentage: tax.taxPercentage || "",
              sgstRate: tax.sgst || "",
              cgstRate: tax.cgst || "",
              igstRate: tax.igst || "",
              taxType: rowTaxType,
            };
          }),
        );

        const opts = enriched.map((r) => ({
          value: r.itemCode,
          label: `${r.itemCode} - ${r.itemDescription || ""}`,
        }));
        setItemOptions(opts);

        setPurchaseRows(enriched.length ? enriched : [getEmptyRow()]);
        return enriched;
      } catch (err) {
        console.error("Failed to load purchase bill items:", err);
        addToast("Failed to load purchase bill items", "error");
        setPurchaseRows([getEmptyRow()]);
        return [];
      } finally {
        setLoadingItems(false);
      }
    },
    [branchId, orgId, form.isIGSTAppl, addToast],
  );

  /* ========================= LOAD BY ID (EDIT) ========================= */
  const loadPurchaseReturnById = useCallback(
    async (id) => {
      if (!id) return;
      setLoading(true);
      try {
        const pr = await purchaseReturnAPI.getPurchaseReturnById(id);
        if (!pr) {
          addToast("Failed to load Purchase Return", "error");
          return;
        }

        const supplierId = pr.supplier?.id || "";

        // ---------- 1) Header form (NO purchaseBillNo here!) ----------
        setForm((p) => ({
          ...p,
          plantId: pr.branch?.id || "",
          prNo: pr.docId || "",
          belongsTo: pr.belongsTo || "",
          prDate: pr.docDate || "",
          supplierId,
          supplierName: pr.supplier?.customerName || "",
          supplierCode: pr.supplier?.customerCode || "",
          gstNo: pr.supplier?.customerGstNo || "",
          gstnNo: pr.supplier?.customerGstNo || "",
          gstState: pr.supplier?.state?.stateName || "",
          grnNo: pr.grnNo || "",
          grnDate: pr.grnDate || "",
          isIGSTAppl: pr.isIgstAppl || "No",
          excisable: !!pr.excisable,
          currency: pr.currency || "",
          vendorDCNo: pr.vendorDcNo || "",
          exchangeRate: pr.exchangeRate || "",
          dealerType: pr.dealerType || "",
          poNo: pr.purchaseorderNumber || "",
          poType: pr.purchaseorderType || "",
          isReverseChrg: !!pr.isReverseChrg,
          voucherPostingDate: pr.voucherPostingDate || "",
          dutyPerUnit: pr.dutyPerUnit || "",
          postingCategory: pr.postingCategory || "",
          modvatCopyReceived: pr.modvatCopyReceived ? "Yes" : "No",
          eccType: pr.eccType || "",
          supplierDCINVNo: pr.supplierDcInvNo || "",
          supplierDCINVDate: pr.supplierDcInvDate || "",
          entryTaxApplicable: pr.entryTaxApplicable ? "Yes" : "No",
          narration: pr.narration || "",
          paymentTerms: pr.paymentTerms || "",
          basicValue: pr.basicValue || 0,
          totalFreight: pr.totalFreight || 0,
        }));

        // ---------- 2) GRN list ----------
        if (supplierId) {
          const grnListLoaded = await loadGrnList(supplierId);

          if (
            pr.grnNo &&
            !(grnListLoaded || []).some(
              (g) => String(g.docId) === String(pr.grnNo),
            )
          ) {
            setGrnList((prev) =>
              prev.some((g) => String(g.docId) === String(pr.grnNo))
                ? prev
                : [
                    {
                      docId: pr.grnNo,
                      docDate: pr.grnDate,
                      poNumber: pr.purchaseorderNumber || "",
                    },
                    ...prev,
                  ],
            );
          }

          // ---------- 3) Bill list + resolve purchaseBillNo ----------
          if (pr.grnNo) {
            const billListLoaded = await loadBills(pr.grnNo, supplierId);

            let resolvedBillNo = pr.purchaseBillNo || "";
            let resolvedBillDate = pr.purchaseBillDate || "";

            if (!resolvedBillNo && (billListLoaded || []).length === 1) {
              resolvedBillNo = billListLoaded[0].docId || "";
              resolvedBillDate = billListLoaded[0].docDate || "";
            }

            if (resolvedBillNo) {
              // Ensure option exists in billList
              const alreadyPresent = (billListLoaded || []).some(
                (b) => String(b.docId) === String(resolvedBillNo),
              );
              if (!alreadyPresent) {
                setBillList((prev) =>
                  prev.some((b) => String(b.docId) === String(resolvedBillNo))
                    ? prev
                    : [
                        {
                          docId: resolvedBillNo,
                          docDate: resolvedBillDate,
                        },
                        ...prev,
                      ],
                );
              }

              // Write it back into form
              setForm((p) => ({
                ...p,
                purchaseBillNo: resolvedBillNo,
                purchaseBillDate: resolvedBillDate,
              }));
            }
          }
        }

        // ---------- 4) Detail rows ----------
        const details = (pr.purchaseReturnDetailsResponseDTO || []).map(
          (d) => ({
            itemCode: d.item?.itemCode || "",
            itemDescription: d.item?.itemDescription || "",
            hsnSacCode: d.hsnSacCode || "",
            hsnId: "",
            item: d.item?.id || "",
            unit: d.unit?.id || "",
            unitId: d.unit?.unitId || "",
            taxType: d.taxType || "",
            taxPercentage: d.taxPercentage || "",
            tariffNo: d.tariffNo || "",
            exciseToPost: d.exciseToPost || "No",
            challanQty: d.challanQty ?? "",
            grnReceivedQty: d.grnReceivedQty ?? "",
            acceptedQty: d.acceptedQty ?? "",
            rejectedQty: d.rejectedQty ?? 0,
            shortageQty: d.shortageQty ?? 0,
            poRate: d.poRate ?? "",
            rateInINR: d.rateInInr ?? "",
            rateInSelectedCurrency: d.rateInSelectedCurrency ?? "",
            apportionedCost: d.apportionedCost ?? "",
            landedCostRate: d.landedCostRate ?? "",
            amount: d.amount ?? "",
            amountInSelectedCurrency: d.amountInSelectedCurrency ?? "",
            additionalDuty: d.additionalDuty ?? "",
            amountInINR: d.amountInInr ?? "",
            sgstRate: d.sgstRate ?? "",
            sgstAmount: d.sgstAmount ?? "",
            cgstRate: d.cgstRate ?? "",
            cgstAmount: d.cgstAmount ?? "",
            igstRate: d.igstRate ?? "",
            igstAmount: d.igstAmount ?? "",
          }),
        );
        setPurchaseRows(details.length ? details : [getEmptyRow()]);

        // Baseline item options from the saved detail rows
        const opts = details.map((r) => ({
          value: r.itemCode,
          label: `${r.itemCode} - ${r.itemDescription || ""}`,
        }));
        setItemOptions(opts);

        // ---------- 5) Tax rows ----------
        const taxRows = (pr.purchaseReturnTaxDetailsResponseDTO || []).map(
          (t) => ({
            particulars: t.particulars || "",
            taxPercentage: t.tax ?? "",
            acceptedQtyAmount: t.acceptedQtyAmount ?? "",
            amount: t.acceptedQtyAmount ?? "",
            revisedAmount: t.revisedAmount ?? "",
            ledgerAccountName: "",
            dbcr: "",
            dbamt: "",
            cramt: "",
            postToFinance: "",
            isSystemRow: SYSTEM_PARTICULARS.includes(t.particulars),
          }),
        );

        const expected = ["Gross Amount"];
        if ((pr.isIgstAppl || "No") === "Yes") expected.push("IGST");
        else expected.push("SGST", "CGST");

        const existingParticulars = taxRows.map((r) => r.particulars);
        expected.forEach((p) => {
          if (!existingParticulars.includes(p)) {
            taxRows.push({
              ...getEmptyTaxRow(),
              particulars: p,
              isSystemRow: true,
            });
          }
        });

        setChargesRows(taxRows.length ? taxRows : [getEmptyTaxRow()]);

        // ---------- 6) Refresh item options from the resolved bill ----------
        const billForItems = pr.purchaseBillNo || form.purchaseBillNo || "";
        // We also can resolve from the single bill we already loaded
        if (pr.grnNo && supplierId) {
          // Try to derive from the current billList state using the closure
          // — but billList hasn't updated yet at this point. So instead
          // fetch directly to populate options without touching rows.
          let billNoToFetch = pr.purchaseBillNo || "";
          if (!billNoToFetch) {
            try {
              const bills = await purchaseReturnAPI.getPurchaseBill(
                branchId,
                pr.grnNo,
                orgId,
                supplierId,
              );
              if (bills?.length === 1) {
                billNoToFetch = bills[0].docId || "";
              }
            } catch {
              /* swallow */
            }
          }
          if (billNoToFetch) {
            purchaseReturnAPI
              .getPurchaseBillItemDetails(
                billNoToFetch,
                branchId,
                pr.grnNo,
                orgId,
                supplierId,
              )
              .then((items) => {
                const fullOpts = (items || []).map((it) => ({
                  value: it.itemCode || "",
                  label: `${it.itemCode || ""} - ${it.itemDescription || ""}`,
                }));
                setItemOptions(fullOpts);
              })
              .catch(() => {});
          }
        }

        addToast("Purchase Return loaded successfully", "success");
      } catch (err) {
        console.error("Error loading purchase return by id:", err);
        addToast("Failed to load Purchase Return", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast, loadGrnList, loadBills, branchId, orgId, form.purchaseBillNo],
  );

  /* ============================== EFFECTS =============================== */
  useEffect(() => {
    loadPlants();
  }, [loadPlants]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  useEffect(() => {
    loadListOfValuesData();
  }, [loadListOfValuesData]);

  // Edit mode -> load by id
  useEffect(() => {
    if (isEditMode && data?.id) {
      loadPurchaseReturnById(data.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, data?.id]);

  // Fill GST State from supplier list when the PR payload has state = null
  useEffect(() => {
    if (!form.supplierId || form.gstState || !suppliers.length) return;
    const sup = suppliers.find(
      (s) => String(s.supplierId) === String(form.supplierId),
    );
    if (sup?.stateName) {
      setForm((p) => ({ ...p, gstState: sup.stateName }));
    }
  }, [form.supplierId, form.gstState, suppliers]);

  // Generate PR No for new records only
  useEffect(() => {
    if (isEditMode && data?.id) return;
    const generate = async () => {
      try {
        const financialYear = new Date().getFullYear().toString();
        const docId = await purchaseReturnAPI.getPurchaseReturnDocId({
          financialYear,
          orgId,
        });
        if (docId) {
          setForm((p) => ({ ...p, prNo: docId }));
        }
      } catch (err) {
        console.error("PR No generation failed", err);
        addToast("Failed to generate PR No", "error");
      }
    };
    if (orgId) generate();
  }, [orgId, isEditMode, data, addToast]);

  /* ========================= CALCULATE TAX DETAILS ===================== */
  const calculateTaxDetails = useCallback(() => {
    if (isUpdatingRef.current) return;

    const totalAmount = purchaseRows.reduce(
      (sum, r) => sum + (Number(r.amount) || 0),
      0,
    );

    const sgstTotal = purchaseRows.reduce(
      (sum, r) => sum + (Number(r.sgstAmount) || 0),
      0,
    );
    const cgstTotal = purchaseRows.reduce(
      (sum, r) => sum + (Number(r.cgstAmount) || 0),
      0,
    );
    const igstTotal = purchaseRows.reduce(
      (sum, r) => sum + (Number(r.igstAmount) || 0),
      0,
    );

    const taxType = form.isIGSTAppl === "Yes" ? "IGST" : "SGST";

    const computeEffectiveRate = (taxAmount) => {
      if (!totalAmount) return 0;
      const r = (taxAmount / totalAmount) * 100;
      return Math.round(r * 100) / 100;
    };

    const firstRowSgstRate =
      Number(
        (purchaseRows.find((r) => Number(r.sgstRate) > 0) || {}).sgstRate,
      ) || 0;
    const firstRowCgstRate =
      Number(
        (purchaseRows.find((r) => Number(r.cgstRate) > 0) || {}).cgstRate,
      ) || 0;
    const firstRowIgstRate =
      Number(
        (purchaseRows.find((r) => Number(r.igstRate) > 0) || {}).igstRate,
      ) || 0;

    const sgstRate = firstRowSgstRate || computeEffectiveRate(sgstTotal);
    const cgstRate = firstRowCgstRate || computeEffectiveRate(cgstTotal);
    const igstRate = firstRowIgstRate || computeEffectiveRate(igstTotal);

    const existing = chargesRows || [];
    const userAddedRows = existing.filter((r) => !r.isSystemRow);

    const systemRows = [
      {
        particulars: "Gross Amount",
        taxPercentage: 0,
        acceptedQtyAmount: totalAmount,
        amount: totalAmount,
        revisedAmount: totalAmount,
        ledgerAccountName: "",
        dbcr: "",
        dbamt: "",
        cramt: "",
        postToFinance: "",
        isSystemRow: true,
      },
    ];

    if (taxType === "IGST") {
      systemRows.push({
        particulars: "IGST",
        taxPercentage: igstRate,
        acceptedQtyAmount: igstTotal,
        amount: igstTotal,
        revisedAmount: igstTotal,
        ledgerAccountName: "",
        dbcr: "",
        dbamt: "",
        cramt: "",
        postToFinance: "",
        isSystemRow: true,
      });
    } else {
      systemRows.push({
        particulars: "SGST",
        taxPercentage: sgstRate,
        acceptedQtyAmount: sgstTotal,
        amount: sgstTotal,
        revisedAmount: sgstTotal,
        ledgerAccountName: "",
        dbcr: "",
        dbamt: "",
        cramt: "",
        postToFinance: "",
        isSystemRow: true,
      });
      systemRows.push({
        particulars: "CGST",
        taxPercentage: cgstRate,
        acceptedQtyAmount: cgstTotal,
        amount: cgstTotal,
        revisedAmount: cgstTotal,
        ledgerAccountName: "",
        dbcr: "",
        dbamt: "",
        cramt: "",
        postToFinance: "",
        isSystemRow: true,
      });
    }

    const allRows = [...systemRows, ...userAddedRows];

    const hasChanged = JSON.stringify(existing) !== JSON.stringify(allRows);

    if (hasChanged) {
      setChargesRows(allRows);
    }
  }, [purchaseRows, chargesRows, form.isIGSTAppl]);

  useEffect(() => {
    const t = setTimeout(() => {
      calculateTaxDetails();
    }, 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseRows, form.isIGSTAppl]);

  /* ============================== HANDLERS ============================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((p) => ({ ...p, [name]: "" }));
    }

    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "supplierId") {
      const sup = suppliers.find((s) => String(s.supplierId) === String(value));
      if (sup) {
        const registered = String(sup.isRegistered).toLowerCase() === "true";
        const igstFlag = registered ? "Yes" : "No";
        const rowTaxType = registered ? "IGST" : "SGST";

        setForm((p) => ({
          ...p,
          supplierId: sup.supplierId,
          supplierName: sup.supplierName,
          supplierCode: sup.supplierCode,
          address: sup.address,
          gstNo: sup.gstNo,
          gstnNo: sup.gstNo,
          gstState: sup.stateName,
          isIGSTAppl: igstFlag,
          grnNo: "",
          grnDate: "",
          poNo: "",
          purchaseBillNo: "",
          purchaseBillDate: "",
        }));

        setGrnList([]);
        setBillList([]);
        setItemOptions([]);

        setPurchaseRows((rows) =>
          rows.map((r) => ({ ...r, taxType: rowTaxType })),
        );

        loadGrnList(sup.supplierId);
      }
    }

    if (name === "grnNo") {
      const grn = grnList.find((g) => g.docId === value);
      if (grn) {
        setForm((p) => ({
          ...p,
          grnNo: grn.docId,
          grnDate: grn.docDate,
          poNo: grn.poNumber,
          purchaseBillNo: "",
          purchaseBillDate: "",
        }));
        setBillList([]);
        setItemOptions([]);
        setPurchaseRows([getEmptyRow()]);
        loadBills(grn.docId, form.supplierId);
      }
    }

    if (name === "purchaseBillNo") {
      const bill = billList.find((b) => b.docId === value);
      if (bill) {
        setForm((p) => ({
          ...p,
          purchaseBillNo: bill.docId,
          purchaseBillDate: bill.docDate,
        }));
        loadBillItems(bill.docId, form.grnNo, form.supplierId);
      }
    }
  };

  /* --------------------- Item code change (select) ----------------------- */
  const handleItemSelect = (index, itemCode) => {
    setPurchaseRows((rows) => {
      const updated = [...rows];
      const r = updated[index];
      if (!r) return rows;
      updated[index] = {
        ...r,
        itemCode,
      };
      return updated;
    });
  };

  /* ---------------------------- Row Recalculation -------------------------- */
  const recalcRow = useCallback((index) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    try {
      setPurchaseRows((rows) => {
        const updated = [...rows];
        const r = updated[index];
        if (!r) return rows;

        const challanQty = Number(r.challanQty) || 0;
        const rateInINR = Number(r.rateInINR) || 0;
        const rateInSelectedCurrency = Number(r.rateInSelectedCurrency) || 0;

        const amount = challanQty * rateInINR;
        const amountInSelectedCurrency = rateInSelectedCurrency * challanQty;
        const amountInINR = amount;

        const sgstRate = Number(r.sgstRate) || 0;
        const cgstRate = Number(r.cgstRate) || 0;
        const igstRate = Number(r.igstRate) || 0;

        let sgstAmount = 0,
          cgstAmount = 0,
          igstAmount = 0;

        if (r.taxType === "IGST") {
          igstAmount = (amount * igstRate) / 100;
        } else if (r.taxType === "SGST") {
          sgstAmount = (amount * sgstRate) / 100;
          cgstAmount = (amount * cgstRate) / 100;
        }

        updated[index] = {
          ...r,
          amount: amount.toFixed(2),
          amountInSelectedCurrency: amountInSelectedCurrency.toFixed(2),
          amountInINR: amountInINR.toFixed(2),
          sgstAmount: sgstAmount.toFixed(2),
          cgstAmount: cgstAmount.toFixed(2),
          igstAmount: igstAmount.toFixed(2),
        };
        return updated;
      });
    } finally {
      isUpdatingRef.current = false;
    }
  }, []);

  useEffect(() => {
    purchaseRows.forEach((_, idx) => recalcRow(idx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseRows.length]);

  const handlePurchaseRowChange = (index, field, value) => {
    setPurchaseRows((rows) => {
      const updated = [...rows];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (
      [
        "challanQty",
        "rateInINR",
        "rateInSelectedCurrency",
        "taxType",
        "sgstRate",
        "cgstRate",
        "igstRate",
      ].includes(field)
    ) {
      setTimeout(() => recalcRow(index), 0);
    }
  };

  const handleChargesRowChange = (index, field, value) => {
    setChargesRows((rows) => {
      const updated = [...rows];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddPurchaseRow = () =>
    setPurchaseRows((r) => [...r, getEmptyRow()]);

  const handleRemovePurchaseRow = (index) => {
    setPurchaseRows((r) =>
      r.length > 1 ? r.filter((_, i) => i !== index) : r,
    );
  };

  const handleAddChargesRow = () =>
    setChargesRows((r) => [...r, getEmptyTaxRow()]);

  const handleRemoveChargesRow = (index) => {
    const row = chargesRows[index];
    if (row?.isSystemRow) {
      addToast("Cannot delete system calculated rows", "error");
      return;
    }
    setChargesRows((r) => (r.length > 1 ? r.filter((_, i) => i !== index) : r));
  };

  /* ============================== TOTALS =============================== */
  const totalFreight = purchaseRows.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0,
  );
  const totalQty = purchaseRows.reduce(
    (sum, r) => sum + (parseFloat(r.challanQty) || 0),
    0,
  );
  const basicValue = totalFreight;

  const sgstTotal = purchaseRows.reduce(
    (s, r) => s + (parseFloat(r.sgstAmount) || 0),
    0,
  );
  const cgstTotal = purchaseRows.reduce(
    (s, r) => s + (parseFloat(r.cgstAmount) || 0),
    0,
  );
  const igstTotal = purchaseRows.reduce(
    (s, r) => s + (parseFloat(r.igstAmount) || 0),
    0,
  );

  const userTaxSum = (chargesRows || [])
    .filter((c) => !c.isSystemRow && c.amount)
    .reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);

  const totalAmount =
    basicValue +
    (form.isIGSTAppl === "Yes" ? igstTotal : sgstTotal + cgstTotal) +
    userTaxSum;

  /* ============================ VALIDATION ============================= */
  const validateForm = () => {
    const errors = {};

    if (!form.plantId) errors.plantId = "Plant ID is required";
    if (!form.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!form.prDate) errors.prDate = "PR Date is required";
    if (!form.supplierId) errors.supplierId = "Supplier is required";
    if (!form.grnNo) errors.grnNo = "GRN No is required";
    if (!form.purchaseBillNo)
      errors.purchaseBillNo = "Purchase Bill No is required";
    if (!form.entryTaxApplicable)
      errors.entryTaxApplicable = "Entry Tax Applicable is required";

    purchaseRows.forEach((r, i) => {
      if (!r.itemCode) errors[`row_${i}_itemCode`] = "Item Code required";
      if (!r.challanQty || Number(r.challanQty) <= 0)
        errors[`row_${i}_challanQty`] = "Challan Qty required";
      if (!r.rateInINR || Number(r.rateInINR) <= 0)
        errors[`row_${i}_rateInINR`] = "Rate required";
      if (!r.amount || Number(r.amount) <= 0)
        errors[`row_${i}_amount`] = "Amount required";
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* =============================== SAVE ================================ */
  const handleSave = async () => {
    if (!validateForm()) {
      addToast("Please fix validation errors before saving", "error");
      return;
    }
    setIsSubmitting(true);
    setSaving(true);
    try {
      const payload = {
        active: true,
        basicValue,
        belongsTo: form.belongsTo,
        branch: parseInt(branchId),
        cancel: false,
        cancelRemarks: "",
        createdBy: localStorage.getItem("userId") || "admin",
        dealerType: form.dealerType || "",
        dutyPerUnit: parseFloat(form.dutyPerUnit) || 0,
        entryTaxApplicable: form.entryTaxApplicable === "Yes",
        exchangeRate: parseFloat(form.exchangeRate) || 0,
        excisable: !!form.excisable,
        financialYear: new Date().getFullYear().toString(),
        grnDate: formatDateForAPI(form.grnDate) || "",
        grnNo: form.grnNo || "",
        isIgstAppl: form.isIGSTAppl || "No",
        isReverseChrg: !!form.isReverseChrg,
        modvatCopyReceived: form.modvatCopyReceived === "Yes",
        narration: form.narration || "",
        orgId: parseInt(orgId),
        paymentTerms: form.paymentTerms || "",
        purchaseReturnDetailsDTO: purchaseRows.map((r) => ({
          acceptedQty: parseFloat(r.acceptedQty) || 0,
          additionalDuty: parseFloat(r.additionalDuty) || 0,
          apportionedCost: parseFloat(r.apportionedCost) || 0,
          challanQty: parseFloat(r.challanQty) || 0,
          exciseToPost: r.exciseToPost || "No",
          grnReceivedQty: parseFloat(r.grnReceivedQty) || 0,
          hsnSacCode: r.hsnSacCode || "",
          item: parseInt(r.item) || 0,
          itemCode: r.itemCode || "",
          itemDescription: r.itemDescription || "",
          landedCostRate: parseFloat(r.landedCostRate) || 0,
          poRate: parseFloat(r.poRate) || 0,
          rateInInr: parseFloat(r.rateInINR) || 0,
          rateInSelectedCurrency: parseFloat(r.rateInSelectedCurrency) || 0,
          rejectedQty: parseFloat(r.rejectedQty) || 0,
          shortageQty: parseFloat(r.shortageQty) || 0,
          tariffNo: r.tariffNo || "",
          taxPercentage: parseFloat(r.taxPercentage) || 0,
          taxType: r.taxType || "",
          unit: parseInt(r.unit) || 0,
        })),
        purchaseReturnTaxDetailsDTO: (chargesRows || [])
          .filter((c) => c.particulars)
          .map((c) => ({
            acceptedQtyAmount: parseFloat(c.acceptedQtyAmount) || 0,
            particulars: c.particulars || "",
            revisedAmount: parseFloat(c.revisedAmount) || 0,
            tax: parseFloat(c.taxPercentage) || 0,
          })),
        purchaseorderDate: formatDateForAPI(form.prDate) || "",
        purchaseorderNumber: form.poNo || "",
        purchaseorderType: form.poType || "",
        supplier: parseInt(form.supplierId) || 0,
        supplierDcInvDate: formatDateForAPI(form.supplierDCINVDate) || "",
        supplierDcInvNo: form.supplierDCINVNo || "",
        totalFreight,
        vendorDcNo: form.vendorDCNo || "",
        voucherPostingDate: formatDateForAPI(form.voucherPostingDate) || "",
      };

      if (isEditMode && data?.id) {
        payload.id = parseInt(data.id);
      }

      const response =
        await purchaseReturnAPI.createUpdatePurchaseReturn(payload);

      const isSuccess =
        response?.status === true ||
        response?.success === true ||
        response?.status === "SUCCESS" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          isEditMode
            ? "Purchase Return updated successfully"
            : "Purchase Return created successfully",
          "success",
        );
        onBack();
      } else {
        addToast(response?.message || "Something went wrong", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      addToast(err?.message || "Failed to save Purchase Return", "error");
    } finally {
      setIsSubmitting(false);
      setSaving(false);
    }
  };

  /* =============================== RENDER ============================== */
  const isIGST = form.isIGSTAppl === "Yes";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading purchase return data…
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Purchase Return" : "Add Purchase Return"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* ----------------------- Header Fields ----------------------- */}
        <div className={fieldGrid}>
          <Field
            type="select"
            label="Plant ID"
            name="plantId"
            value={form.plantId}
            onChange={handleChange}
            options={plantData}
            required
            disabled={loadingPlant}
            error={fieldErrors.plantId}
          />
          <Field
            label="PR No"
            name="prNo"
            value={form.prNo}
            onChange={handleChange}
            placeholder="Auto"
            disabled
          />
          <Field
            type="select"
            label="Belongs To"
            name="belongsTo"
            value={form.belongsTo}
            onChange={handleChange}
            options={BELONGS_TO_OPTIONS}
            required
            error={fieldErrors.belongsTo}
          />
          <Field
            type="date"
            label="PR Date"
            name="prDate"
            value={form.prDate}
            onChange={handleChange}
            required
            error={fieldErrors.prDate}
          />

          <Field
            type="select"
            label="Supplier"
            name="supplierId"
            value={form.supplierId}
            onChange={handleChange}
            options={suppliers.map((s) => ({
              value: s.supplierId,
              label: `${s.supplierCode} - ${s.supplierName}`,
            }))}
            required
            disabled={loadingSuppliers}
            error={fieldErrors.supplierId}
          />
          <Field
            label="Supplier Name"
            name="supplierName"
            value={form.supplierName}
            onChange={handleChange}
            placeholder="Auto"
            disabled
          />
          <Field
            label="GST State"
            name="gstState"
            value={form.gstState}
            onChange={handleChange}
            placeholder="Auto"
            disabled
          />
          <Field
            label="GSTN No"
            name="gstnNo"
            value={form.gstnNo}
            onChange={handleChange}
            placeholder="Auto"
            disabled
          />

          {/* -------- GRN No (with injected current value) -------- */}
          <Field
            type="select"
            label="GRN No"
            name="grnNo"
            value={form.grnNo}
            onChange={handleChange}
            options={(() => {
              const base = grnList.map((g) => ({
                value: g.docId,
                label: `${g.docId} - ${g.docDate}`,
              }));
              const hasCurrent =
                form.grnNo &&
                base.some((o) => String(o.value) === String(form.grnNo));
              if (form.grnNo && !hasCurrent) {
                return [
                  {
                    value: form.grnNo,
                    label: form.grnDate
                      ? `${form.grnNo} - ${form.grnDate}`
                      : form.grnNo,
                  },
                  ...base,
                ];
              }
              return base;
            })()}
            required
            disabled={!form.supplierId || loadingGrn}
            error={fieldErrors.grnNo}
          />
          <Field
            type="date"
            label="GRN Date"
            name="grnDate"
            value={form.grnDate}
            onChange={handleChange}
            disabled
          />

          {/* -------- Purchase Bill No (with injected current value) -------- */}
          <Field
            type="select"
            label="Purchase Bill No"
            name="purchaseBillNo"
            value={form.purchaseBillNo}
            onChange={handleChange}
            options={(() => {
              const base = billList.map((b) => ({
                value: b.docId,
                label: `${b.docId} - ${b.docDate}`,
              }));
              const hasCurrent =
                form.purchaseBillNo &&
                base.some(
                  (o) => String(o.value) === String(form.purchaseBillNo),
                );
              if (form.purchaseBillNo && !hasCurrent) {
                return [
                  {
                    value: form.purchaseBillNo,
                    label: form.purchaseBillDate
                      ? `${form.purchaseBillNo} - ${form.purchaseBillDate}`
                      : form.purchaseBillNo,
                  },
                  ...base,
                ];
              }
              return base;
            })()}
            required
            disabled={!form.grnNo || loadingBill}
            error={fieldErrors.purchaseBillNo}
          />
          <Field
            type="date"
            label="Purchase Bill Date"
            name="purchaseBillDate"
            value={form.purchaseBillDate}
            onChange={handleChange}
            disabled
          />

          <Field
            label="PO No/PC No"
            name="poNo"
            value={form.poNo}
            onChange={handleChange}
            placeholder="Auto"
            disabled
          />
          <Field
            type="select"
            label="Is IGST Appl"
            name="isIGSTAppl"
            value={form.isIGSTAppl}
            onChange={handleChange}
            options={YES_NO_OPTIONS}
          />
          <Field
            type="checkbox"
            label="Excisable ?"
            name="excisable"
            checked={form.excisable}
            onChange={handleChange}
          />
          <Field
            label="Exchange Rate"
            name="exchangeRate"
            type="number"
            value={form.exchangeRate}
            onChange={handleChange}
            placeholder="0.00"
          />

          <Field
            label="Vendor DC No."
            name="vendorDCNo"
            value={form.vendorDCNo}
            onChange={handleChange}
          />
          <Field
            label="Supplier DC/INV No."
            name="supplierDCINVNo"
            value={form.supplierDCINVNo}
            onChange={handleChange}
          />
          <Field
            type="date"
            label="Supplier DC/INV Date"
            name="supplierDCINVDate"
            value={form.supplierDCINVDate}
            onChange={handleChange}
          />
          <Field
            type="date"
            label="Voucher Posting Date"
            name="voucherPostingDate"
            value={form.voucherPostingDate}
            onChange={handleChange}
          />
        </div>

        {/* ---------------------------- Tabs ---------------------------- */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-4">
          {[
            { key: "purchaseDetail", label: "Purchase Detail" },
            { key: "taxGrid", label: "Tax Grid" },
            { key: "chargesSummary", label: "Charges Summary" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${
                activeTab === t.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* --------------------- Purchase Detail Tab -------------------- */}
        {activeTab === "purchaseDetail" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Purchase Return Details{" "}
                {loadingItems && (
                  <span className="ml-2 text-blue-500 normal-case font-normal">
                    Loading items…
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={handleAddPurchaseRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[1800px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    {[
                      { label: "S.No", cls: "text-center w-10" },
                      {
                        label: "Item Code *",
                        cls: "text-left min-w-[130px]",
                      },
                      {
                        label: "Item Description",
                        cls: "text-left min-w-[110px]",
                      },
                      {
                        label: "HSN/SAC Code *",
                        cls: "text-left min-w-[90px]",
                      },
                      {
                        label: "Tax Type *",
                        cls: "text-left min-w-[80px]",
                      },
                      {
                        label: "Tax (%)",
                        cls: "text-left min-w-[70px]",
                      },
                      {
                        label: "Tariff No",
                        cls: "text-left min-w-[80px]",
                      },
                      {
                        label: "Excise To Post",
                        cls: "text-left min-w-[80px]",
                      },
                      {
                        label: "Challan Qty",
                        cls: "text-left min-w-[70px]",
                      },
                      {
                        label: "Unit",
                        cls: "text-left min-w-[60px]",
                      },
                      {
                        label: "GRN Received Qty",
                        cls: "text-left min-w-[90px]",
                      },
                      {
                        label: "Accepted Qty *",
                        cls: "text-left min-w-[90px]",
                      },
                      {
                        label: "Rejected Qty",
                        cls: "text-left min-w-[90px]",
                      },
                      {
                        label: "Shortage Qty",
                        cls: "text-left min-w-[90px]",
                      },
                      {
                        label: "PO Rate",
                        cls: "text-left min-w-[80px]",
                      },
                      {
                        label: "Rate In INR *",
                        cls: "text-left min-w-[90px]",
                      },
                      {
                        label: "Rate In Selected Currency",
                        cls: "text-left min-w-[110px]",
                      },
                      {
                        label: "Apportioned Cost",
                        cls: "text-left min-w-[90px]",
                      },
                      {
                        label: "Landed Cost Rate",
                        cls: "text-left min-w-[90px]",
                      },
                      {
                        label: "Amount *",
                        cls: "text-left min-w-[90px]",
                      },
                      {
                        label: "Amount In Selected Currency",
                        cls: "text-left min-w-[110px]",
                      },
                      {
                        label: "Additional Duty",
                        cls: "text-left min-w-[90px]",
                      },
                      {
                        label: "Amount In INR",
                        cls: "text-left min-w-[90px]",
                      },
                    ].map((h, i) => (
                      <th
                        key={i}
                        className={`p-1 dark:text-gray-200 text-[10px] whitespace-nowrap ${h.cls}`}
                      >
                        {h.label}
                      </th>
                    ))}

                    {isIGST ? (
                      <>
                        <th className="p-1 dark:text-gray-200 text-[10px] text-left min-w-[70px] whitespace-nowrap">
                          IGST Rate
                        </th>
                        <th className="p-1 dark:text-gray-200 text-[10px] text-left min-w-[90px] whitespace-nowrap">
                          IGST Amount
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="p-1 dark:text-gray-200 text-[10px] text-left min-w-[70px] whitespace-nowrap">
                          SGST Rate
                        </th>
                        <th className="p-1 dark:text-gray-200 text-[10px] text-left min-w-[90px] whitespace-nowrap">
                          SGST Amount
                        </th>
                        <th className="p-1 dark:text-gray-200 text-[10px] text-left min-w-[70px] whitespace-nowrap">
                          CGST Rate
                        </th>
                        <th className="p-1 dark:text-gray-200 text-[10px] text-left min-w-[90px] whitespace-nowrap">
                          CGST Amount
                        </th>
                      </>
                    )}

                    <th className="p-1 dark:text-gray-200 text-[10px] text-center w-10 whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseRows.map((row, index) => {
                    const itemOptsForRow = (() => {
                      const base = itemOptions || [];
                      const hasCurrent = base.some(
                        (o) => String(o.value) === String(row.itemCode),
                      );
                      if (row.itemCode && !hasCurrent) {
                        return [
                          {
                            value: row.itemCode,
                            label: `${row.itemCode} - ${
                              row.itemDescription || ""
                            }`,
                          },
                          ...base,
                        ];
                      }
                      return base;
                    })();

                    return (
                      <tr
                        key={index}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="p-1 text-center font-medium dark:text-gray-300">
                          {index + 1}
                        </td>
                        <td className="p-1">
                          <select
                            value={row.itemCode || ""}
                            onChange={(e) =>
                              handleItemSelect(index, e.target.value)
                            }
                            className={`${cellInput} min-w-[130px] ${
                              fieldErrors[`row_${index}_itemCode`]
                                ? "border-red-500"
                                : ""
                            }`}
                          >
                            <option value="">Select</option>
                            {itemOptsForRow.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={row.itemDescription}
                            className={`${cellInput} min-w-[110px]`}
                            disabled
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={row.hsnSacCode}
                            className={`${cellInput} min-w-[90px]`}
                            disabled
                          />
                        </td>
                        <td className="p-1">
                          <select
                            value={row.taxType}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "taxType",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[80px]`}
                          >
                            <option value="">Select</option>
                            {TAX_TYPE_OPTIONS.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.taxPercentage}
                            className={`${cellInput} min-w-[70px]`}
                            disabled
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={row.tariffNo}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "tariffNo",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[80px]`}
                          />
                        </td>
                        <td className="p-1">
                          <select
                            value={row.exciseToPost}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "exciseToPost",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[80px]`}
                          >
                            {EXCISE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.challanQty}
                            className={`${cellInput} min-w-[70px] ${
                              fieldErrors[`row_${index}_challanQty`]
                                ? "border-red-500"
                                : ""
                            }`}
                            disabled
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={row.unitId || row.unit}
                            className={`${cellInput} min-w-[60px]`}
                            disabled
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.grnReceivedQty}
                            className={`${cellInput} min-w-[90px]`}
                            disabled
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.acceptedQty}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "acceptedQty",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[90px]`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.rejectedQty}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "rejectedQty",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[90px]`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.shortageQty}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "shortageQty",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[90px]`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.poRate}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "poRate",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[80px]`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.rateInINR}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "rateInINR",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[90px] ${
                              fieldErrors[`row_${index}_rateInINR`]
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.rateInSelectedCurrency}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "rateInSelectedCurrency",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[110px]`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.apportionedCost}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "apportionedCost",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[90px]`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.landedCostRate}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "landedCostRate",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[90px]`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.amount}
                            className={`${cellInput} min-w-[90px] ${
                              fieldErrors[`row_${index}_amount`]
                                ? "border-red-500"
                                : ""
                            }`}
                            disabled
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.amountInSelectedCurrency}
                            className={`${cellInput} min-w-[110px]`}
                            disabled
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.additionalDuty}
                            onChange={(e) =>
                              handlePurchaseRowChange(
                                index,
                                "additionalDuty",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[90px]`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.amountInINR}
                            className={`${cellInput} min-w-[90px]`}
                            disabled
                          />
                        </td>

                        {isIGST ? (
                          <>
                            <td className="p-1">
                              <input
                                type="number"
                                value={row.igstRate}
                                onChange={(e) =>
                                  handlePurchaseRowChange(
                                    index,
                                    "igstRate",
                                    e.target.value,
                                  )
                                }
                                className={`${cellInput} min-w-[70px]`}
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="number"
                                value={row.igstAmount}
                                className={`${cellInput} min-w-[90px]`}
                                disabled
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-1">
                              <input
                                type="number"
                                value={row.sgstRate}
                                onChange={(e) =>
                                  handlePurchaseRowChange(
                                    index,
                                    "sgstRate",
                                    e.target.value,
                                  )
                                }
                                className={`${cellInput} min-w-[70px]`}
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="number"
                                value={row.sgstAmount}
                                className={`${cellInput} min-w-[90px]`}
                                disabled
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="number"
                                value={row.cgstRate}
                                onChange={(e) =>
                                  handlePurchaseRowChange(
                                    index,
                                    "cgstRate",
                                    e.target.value,
                                  )
                                }
                                className={`${cellInput} min-w-[70px]`}
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="number"
                                value={row.cgstAmount}
                                className={`${cellInput} min-w-[90px]`}
                                disabled
                              />
                            </td>
                          </>
                        )}

                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePurchaseRow(index)}
                            disabled={purchaseRows.length <= 1}
                            className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${
                              purchaseRows.length <= 1
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            <Trash2 size={10} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------- Tax Grid Tab ----------------------- */}
        {activeTab === "taxGrid" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Tax Grid
                {loadingParticulars && (
                  <span className="ml-2 text-blue-500 normal-case font-normal">
                    Loading particulars…
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={handleAddChargesRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[900px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    {[
                      "S.No",
                      "Particulars *",
                      "Tax%",
                      "Accepted Qty Amount",
                      "Amount",
                      "Revised Amount",
                      "Action",
                    ].map((h, i) => (
                      <th
                        key={i}
                        className={`p-1 dark:text-gray-200 text-[10px] whitespace-nowrap ${
                          i === 0 || i === 6
                            ? "text-center w-10"
                            : "text-left min-w-[90px]"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chargesRows.map((row, index) => {
                    const isSystemRow = row.isSystemRow;
                    const isReadOnly =
                      isSystemRow ||
                      SYSTEM_PARTICULARS.includes(row.particulars);

                    return (
                      <tr
                        key={index}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="p-1 text-center font-medium dark:text-gray-300">
                          {index + 1}
                        </td>
                        <td className="p-1">
                          <select
                            value={row.particulars}
                            onChange={(e) =>
                              handleChargesRowChange(
                                index,
                                "particulars",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[110px] ${
                              isReadOnly
                                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isReadOnly || loadingParticulars}
                          >
                            <option value="">Select</option>
                            {isSystemRow ? (
                              <option value={row.particulars}>
                                {row.particulars}
                              </option>
                            ) : (
                              (listOfValuesData.PARTICULARS || [])
                                .filter(
                                  (opt) =>
                                    !SYSTEM_PARTICULARS.includes(opt.label),
                                )
                                .map((opt) => (
                                  <option
                                    key={opt.value || opt.label}
                                    value={opt.label}
                                  >
                                    {opt.label}
                                  </option>
                                ))
                            )}
                          </select>
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.taxPercentage}
                            onChange={(e) =>
                              handleChargesRowChange(
                                index,
                                "taxPercentage",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[70px] ${
                              isReadOnly
                                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isReadOnly}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.acceptedQtyAmount}
                            onChange={(e) =>
                              handleChargesRowChange(
                                index,
                                "acceptedQtyAmount",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[100px] ${
                              isReadOnly
                                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isReadOnly}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.amount}
                            onChange={(e) =>
                              handleChargesRowChange(
                                index,
                                "amount",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[90px] ${
                              isReadOnly
                                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isReadOnly}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            value={row.revisedAmount}
                            onChange={(e) =>
                              handleChargesRowChange(
                                index,
                                "revisedAmount",
                                e.target.value,
                              )
                            }
                            className={`${cellInput} min-w-[90px] ${
                              isReadOnly
                                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isReadOnly}
                          />
                        </td>
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveChargesRow(index)}
                            disabled={isReadOnly || chargesRows.length <= 1}
                            className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${
                              isReadOnly || chargesRows.length <= 1
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            <Trash2 size={10} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------- Charges Summary Tab ------------------- */}
        {activeTab === "chargesSummary" && (
          <div className="mt-2 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field
                label="Total Freight"
                name="totalFreight"
                value={totalFreight.toFixed(2)}
                onChange={() => {}}
                disabled
              />
              <Field
                label="Total Qty"
                name="totalQty"
                value={totalQty}
                onChange={() => {}}
                disabled
              />
              <Field
                label="Basic Value"
                name="basicValue"
                value={basicValue.toFixed(2)}
                onChange={() => {}}
                disabled
              />
              <Field
                label="Total Amount"
                name="totalAmount"
                value={totalAmount.toFixed(2)}
                onChange={() => {}}
                disabled
              />
              <Field
                label="Amount in Words"
                name="amountInWords"
                value="Rupees Only"
                onChange={() => {}}
                disabled
                className="col-span-2"
              />
              <Field
                type="select"
                label="Entry Tax Applicable *"
                name="entryTaxApplicable"
                value={form.entryTaxApplicable}
                onChange={handleChange}
                options={YES_NO_OPTIONS}
                required
                error={fieldErrors.entryTaxApplicable}
              />
            </div>

            <div className={fieldGrid}>
              <Field
                label="Narration"
                name="narration"
                value={form.narration}
                onChange={handleChange}
                placeholder="Enter Narration"
                className="col-span-2"
              />
              <Field
                label="Payment Terms"
                name="paymentTerms"
                value={form.paymentTerms}
                onChange={handleChange}
                placeholder="Enter Payment Terms"
                className="col-span-2"
              />
            </div>
          </div>
        )}

        {/* --------------------------- Buttons -------------------------- */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />{" "}
            {saving || isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update"
                : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturnForm;
