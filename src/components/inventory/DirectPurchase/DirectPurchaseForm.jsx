import { ArrowLeft, Save, X, Plus, Trash2, Copy } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";

import branchAPI from "../../../api/branchAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import directPurchaseAPI from "../../../api/Purchase/directPurchaseAPI";

import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const ToggleButton = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
      value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span
      className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
        value ? "translate-x-6" : "translate-x-0.5"
      }`}
    />
  </button>
);

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const toInteger = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = parseInt(value, 10);

  return Number.isFinite(number) ? number : fallback;
};

const SUPP_TYPE_OPTIONS = ["Local", "Import"];

const DEALER_TYPE_OPTIONS = ["Registered", "Unregistered", "Importer"];

const TAX_TYPE_OPTIONS = ["GST", "IGST", "Nil Rated", "Exempted", "Non-GST"];

const PARTICULARS_OPTIONS = ["SGST", "CGST", "IGST", "CESS", "SWS"];

const TAX_STRUCTURE_OPTIONS = ["GST", "Non-GST", "Composite"];

const SUBTYPE_OPTIONS = ["Regular", "Casual", "SEZ", "EOU"];

const UNIT_FALLBACK_OPTIONS = [
  {
    value: 1000000004,
    label: "NOS",
  },
  {
    value: 1000000005,
    label: "KG",
  },
];

const LEDGER_ACCOUNT_OPTIONS = [
  "Input CGST",
  "Input SGST",
  "Input IGST",
  "CENVAT",
  "VAT",
  "Service Tax",
];

const DirectPurchaseForm = ({ data, onBack }) => {
  const { addToast } = useToast();

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;

  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const USER_NAME =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "SYSTEM";

  const isEditMode = Boolean(data?.id);

  const [activeTab, setActiveTab] = useState("cashDetail");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});

  /* ======================================================================== */
  /* HEADER */
  /* ======================================================================== */

  const [form, setForm] = useState({
    id: data?.id || 0,

    branch: String(data?.branch ?? data?.plantId ?? BRANCH_ID ?? ""),

    invNo: data?.invNo || data?.docNo || "",

    invDate: data?.invDate || data?.docDate || dayjs().format("YYYY-MM-DD"),

    belongsTo: data?.belongsTo || "Domestic",

    suppType: data?.suppType || "Local",

    supplierCode: data?.supplierCode || "",

    supplierName: data?.supplierName || "",

    gstnNo: data?.gstnNo || data?.gstNo || "",

    dealerType: data?.dealerType || "",

    issueTo: data?.issueTo || "",

    itemCategory: data?.itemCategory ?? "",

    taxStructure: data?.taxStructure || "",

    tariffHeading: data?.tariffHeading || "",

    creditAcName: data?.creditAcName || "",

    subType: data?.subType || "",

    eccNoStNo: data?.eccNoStNo || data?.eccNo || "",

    tallyRefNo: data?.tallyRefNo || "",

    gstState: data?.gstState ?? "",

    gstStateCode: data?.gstStateCode || "",

    financialYear: data?.financialYear || String(new Date().getFullYear()),

    preparedBy: data?.preparedBy ?? "",

    isIgstApplicable:
      data?.isIgstApplicable === true ||
      String(data?.isIgstApplicable).toLowerCase() === "yes",

    reverseCharge:
      data?.isReverseCharge === true ||
      data?.reverseCharge === true ||
      String(data?.isReverseCharge).toLowerCase() === "yes",

    active:
      data?.active !== false &&
      String(data?.active).toLowerCase() !== "inactive",

    cancelRemarks: data?.cancelRemarks || "",

    createdBy: data?.createdBy || USER_NAME,
  });

  const effectiveBranchId = toInteger(form.branch || BRANCH_ID);

  /* ======================================================================== */
  /* CASH ITEMS */
  /* ======================================================================== */

  const createEmptyCashItem = () => ({
    id: Date.now() + Math.random(),

    itemCode: "",
    itemDescription: "",

    hsnCode: "",

    taxType: "",

    tax: "",

    unit: "",

    dcQty: "",
    receivedQty: "",

    rate: "",
    amount: "",

    taxDescription: "",

    sgstPerc: "",
    sgstAmount: "",

    cgstPerc: "",
    cgstAmount: "",

    igstPerc: "",
    igstAmount: "",
  });

  const [cashItems, setCashItems] = useState(() => {
    const source = data?.directPurchaseCashDetailsDTO || data?.cashItems || [];

    if (source.length) {
      return source.map((row) => ({
        id: Date.now() + Math.random(),

        itemCode: row.itemCode || "",

        itemDescription: row.itemDescription || row.description || "",

        hsnCode: row.hsnCode || row.hsn || "",

        taxType: row.taxType || "",

        tax: row.tax ?? row.taxPerc ?? "",

        unit: row.unit ?? "",

        dcQty: row.dcQty ?? row.qty ?? "",

        receivedQty: row.receivedQty ?? "",

        rate: row.rate ?? "",

        amount: row.amount ?? "",

        taxDescription: row.taxDescription || "",

        sgstPerc: row.sgstPerc ?? "",

        sgstAmount: row.sgstAmount ?? "",

        cgstPerc: row.cgstPerc ?? "",

        cgstAmount: row.cgstAmount ?? "",

        igstPerc: row.igstPerc ?? "",

        igstAmount: row.igstAmount ?? "",
      }));
    }

    return [createEmptyCashItem()];
  });

  /* ======================================================================== */
  /* TAX ROWS */
  /* ======================================================================== */

  const createEmptyTaxRow = () => ({
    id: Date.now() + Math.random(),

    particulars: "",

    taxId: "",

    tax: "",

    taxPerc: "",

    acceptedQtyAmount: "",

    acceptedAmt: "",

    revisedAmount: "",

    revisedAmt: "",

    ledgerAcName: "",
  });

  const [taxRows, setTaxRows] = useState(() => {
    const source = data?.directPurchaseTaxDetailsDTO || data?.taxDetails || [];

    if (source.length) {
      return source.map((row) => ({
        id: Date.now() + Math.random(),

        particulars: row.particulars || "",

        taxId: row.taxId || "",

        tax: row.tax ?? row.taxPerc ?? "",

        taxPerc: row.taxPerc ?? row.tax ?? "",

        acceptedQtyAmount: row.acceptedQtyAmount ?? row.acceptedAmt ?? "",

        acceptedAmt: row.acceptedAmt ?? row.acceptedQtyAmount ?? "",

        revisedAmount: row.revisedAmount ?? row.revisedAmt ?? "",

        revisedAmt: row.revisedAmt ?? row.revisedAmount ?? "",

        ledgerAcName: row.ledgerAcName || "",
      }));
    }

    return [createEmptyTaxRow()];
  });

  /* ======================================================================== */
  /* SUMMARY */
  /* ======================================================================== */

  const [summary, setSummary] = useState({
    basicAmount: data?.basicAmount ?? "",

    discount: data?.discount ?? "",

    afterDiscountTotal: data?.afterDiscountTotal ?? "",

    totalAmount: data?.totalAmount ?? "",

    preparedBy: data?.preparedBy ?? "",

    remarks: data?.remarks || "",
  });

  const [remarks, setRemarks] = useState(data?.remarks || "");

  /* ======================================================================== */
  /* ATTACHMENTS */
  /* ======================================================================== */

  const [attachments, setAttachments] = useState(
    data?.attachments?.length
      ? data.attachments
      : [
          {
            id: Date.now() + Math.random(),
            file: null,
          },
        ],
  );

  /* ======================================================================== */
  /* MASTER DATA */
  /* ======================================================================== */

  const [branchOptions, setBranchOptions] = useState([]);

  const [supplierOptions, setSupplierOptions] = useState([]);

  const [issueToOptions, setIssueToOptions] = useState([]);

  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [itemCategoryOptions, setItemCategoryOptions] = useState([]);

  const [gstStateOptions, setGstStateOptions] = useState([]);

  /*
   * Belongs To is now loaded from the List of Values API.
   *
   * The value sent to backend is the LOV description itself,
   * for example:
   *
   * Domestic
   * Import
   *
   * NOT the LOV ID.
   */
  const [belongsToOptions, setBelongsToOptions] = useState([]);

  const [unitOptions, setUnitOptions] = useState(UNIT_FALLBACK_OPTIONS);

  /* ======================================================================== */
  /* LOAD BRANCHES */
  /* ======================================================================== */

  const loadBranches = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branches ||
          response?.paramObjectsMap?.branchVO ||
          [];

      setBranchOptions(
        list.map((branch) => ({
          value: branch.id,

          label:
            branch.branchName ||
            branch.name ||
            branch.branchCode ||
            `Branch ${branch.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);

      setBranchOptions([]);
    }
  }, [ORG_ID]);

  /* ======================================================================== */
  /* LOAD EMPLOYEES */
  /* ======================================================================== */

  const loadEmployees = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await employeeAPI.getEmployeeByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.employees ||
          response?.paramObjectsMap?.employeeVO ||
          [];

      setEmployeeOptions(
        list.map((employee) => ({
          value: employee.id,

          label:
            employee.employeeName || employee.name || `Employee ${employee.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load employees:", error);

      setEmployeeOptions([]);
    }
  }, [ORG_ID]);

  /* ======================================================================== */
  /* LOAD ITEM CATEGORY */
  /* ======================================================================== */

  const loadItemCategories = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await listOfValuesAPI.getListValuesGroup(
        "ITEM CATEGORY",
        ORG_ID,
      );

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.listValues ||
          response?.paramObjectsMap?.values ||
          [];

      setItemCategoryOptions(
        list.map((item) => ({
          value: item.id,

          label:
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            item.value ||
            "",
        })),
      );
    } catch (error) {
      console.error("Failed to load item categories:", error);

      setItemCategoryOptions([]);
    }
  }, [ORG_ID]);

  /* ======================================================================== */
  /* LOAD GST STATES */
  /* ======================================================================== */

  const loadGstStates = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await listOfValuesAPI.getListValuesGroup(
        "GST STATE",
        ORG_ID,
      );

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.listValues ||
          response?.paramObjectsMap?.values ||
          [];

      setGstStateOptions(
        list.map((item) => ({
          value: item.id,

          label:
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            item.value ||
            "",

          code: item.code || item.stateCode || item.gstStateCode || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load GST states:", error);

      setGstStateOptions([]);
    }
  }, [ORG_ID]);

  /* ======================================================================== */
  /* LOAD BELONGS TO */
  /* ======================================================================== */

  const loadBelongsTo = useCallback(async () => {
    try {
      if (!ORG_ID) {
        console.warn("ORG_ID is missing. Cannot load Belongs To values.");

        setBelongsToOptions([]);

        return;
      }

      const response = await listOfValuesAPI.getListValuesGroup(
        "BELONGS TO",
        ORG_ID,
      );

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.listValues ||
          response?.paramObjectsMap?.values ||
          response?.paramObjectsMap?.listValueDetails ||
          [];

      const options = list
        .map((item) => {
          const description =
            item?.valuesDescription ||
            item?.valueDescription ||
            item?.description ||
            item?.value ||
            "";

          return {
            value: description,
            label: description,
          };
        })
        .filter((item) => item.value);

      setBelongsToOptions(options);
    } catch (error) {
      console.error("Failed to load Belongs To values:", error);

      setBelongsToOptions([]);
    }
  }, [ORG_ID]);

  /* ======================================================================== */
  /* LOAD SUPPLIERS */
  /* ======================================================================== */

  const loadSuppliers = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) {
        return;
      }

      const response = await directPurchaseAPI.getSupplierDetails(
        effectiveBranchId,
        ORG_ID,
      );

      const dataResp = response?.data ?? response;

      const list =
        dataResp?.paramObjectsMap?.mapp ||
        dataResp?.paramObjectsMap?.supplierVO ||
        dataResp?.paramObjectsMap?.suppliers ||
        (Array.isArray(dataResp) ? dataResp : []);

      setSupplierOptions(
        list.map((supplier) => ({
          value: supplier.supplierId || supplier.id,

          label: supplier.supplierCode || "",

          supplierCode: supplier.supplierCode || "",

          supplierName: supplier.supplierName || "",

          gstNo: supplier.gstNo || supplier.gstnNo || supplier.gstinNo || "",

          isRegistered:
            supplier.isRegistered === true ||
            String(supplier.isRegistered).toLowerCase() === "true",
        })),
      );
    } catch (error) {
      console.error("Failed to load suppliers:", error);

      setSupplierOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  /* ======================================================================== */
  /* LOAD ISSUE TO */
  /* ======================================================================== */

  const loadIssueTo = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) {
        return;
      }

      const response = await directPurchaseAPI.getIssueTo(
        effectiveBranchId,
        ORG_ID,
      );

      const source = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.issueTo ||
          response?.paramObjectsMap?.mapp ||
          [];

      setIssueToOptions(
        source.map((row) => ({
          value: row.issueTo || row.id || "",

          label: row.issueTo || row.name || row.description || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load Issue To:", error);

      setIssueToOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  /* ======================================================================== */
  /* INITIAL MASTER LOAD */
  /* ======================================================================== */

  useEffect(() => {
    loadBranches();
    loadEmployees();
    loadItemCategories();
    loadGstStates();
    loadBelongsTo();
  }, [
    loadBranches,
    loadEmployees,
    loadItemCategories,
    loadGstStates,
    loadBelongsTo,
  ]);

  /* ======================================================================== */
  /* BRANCH DEPENDENT MASTER LOAD */
  /* ======================================================================== */

  useEffect(() => {
    loadSuppliers();
    loadIssueTo();
  }, [loadSuppliers, loadIssueTo]);

  /* ======================================================================== */
  /* DOC NO GENERATION */
  /* ======================================================================== */

  useEffect(() => {
    if (isEditMode) return;
    if (!ORG_ID) return;
    if (!form.financialYear) return;

    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);

      try {
        const docId = await directPurchaseAPI.getDirectPurchaseDocId(
          form.financialYear,
          ORG_ID,
        );

        if (!cancelled) {
          setForm((previous) => ({
            ...previous,
            invNo: docId || "",
          }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error generating Direct Purchase doc id:", error);

          addToast("Failed to generate Bill No", "error");
        }
      } finally {
        if (!cancelled) {
          setGeneratingDocId(false);
        }
      }
    };

    generateDocId();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, ORG_ID, form.financialYear, addToast]);

  /* ======================================================================== */
  /* GST STATE CODE */
  /* ======================================================================== */

  useEffect(() => {
    if (!form.gstState) {
      return;
    }

    const selected = gstStateOptions.find(
      (option) => String(option.value) === String(form.gstState),
    );

    const possibleCode = selected?.code || selected?.stateCode || "";

    if (possibleCode) {
      setForm((previous) => ({
        ...previous,
        gstStateCode: possibleCode,
      }));
    }
  }, [form.gstState, gstStateOptions]);

  /* ======================================================================== */
  /* FIELD HANDLERS */
  /* ======================================================================== */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    if (name === "branch") {
      setForm((previous) => ({
        ...previous,

        branch: value,

        supplierCode: "",
        supplierName: "",
        gstnNo: "",
        dealerType: "",
        issueTo: "",
      }));

      setSupplierOptions([]);
      setIssueToOptions([]);

      return;
    }

    if (name === "supplierCode") {
      const selected = supplierOptions.find(
        (option) => String(option.value) === String(value),
      );

      setForm((previous) => ({
        ...previous,

        supplierCode: selected?.supplierCode || value,

        supplierName: selected?.supplierName || "",

        gstnNo: selected?.gstNo || "",

        dealerType: selected?.isRegistered ? "Registered" : "Unregistered",

        isIgstApplicable: Boolean(selected?.isRegistered),
      }));

      if (fieldErrors.supplierCode) {
        setFieldErrors((previous) => ({
          ...previous,
          supplierCode: "",
        }));
      }

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  /* ======================================================================== */
  /* CASH DETAIL */
  /* ======================================================================== */

  const addCashItem = () => {
    setCashItems((previous) => [...previous, createEmptyCashItem()]);
  };

  const removeCashItem = (id) => {
    setCashItems((previous) =>
      previous.length <= 1 ? previous : previous.filter((row) => row.id !== id),
    );
  };

  const copyCashItem = (source) => {
    setCashItems((previous) => [
      ...previous,
      {
        ...source,
        id: Date.now() + Math.random(),
      },
    ]);
  };

  const handleCashItemChange = (id, field, value) => {
    setCashItems((previous) =>
      previous.map((row) => {
        if (row.id !== id) {
          return row;
        }

        const updated = {
          ...row,
          [field]: value,
        };

        /* --------------------------------------------------------------- */
        /* AMOUNT */
        /* --------------------------------------------------------------- */

        if (field === "dcQty" || field === "receivedQty" || field === "rate") {
          const qty = parseFloat(updated.receivedQty || updated.dcQty) || 0;

          const rate = parseFloat(updated.rate) || 0;

          updated.amount = (qty * rate).toFixed(2);
        }

        /* --------------------------------------------------------------- */
        /* TAX TYPE */
        /* --------------------------------------------------------------- */

        if (field === "taxType") {
          if (value === "GST") {
            updated.taxDescription = "GST";

            updated.sgstPerc = "9";
            updated.cgstPerc = "9";
            updated.igstPerc = "0";

            updated.tax = "18";
          } else if (value === "IGST") {
            updated.taxDescription = "IGST";

            updated.sgstPerc = "0";
            updated.cgstPerc = "0";
            updated.igstPerc = "18";

            updated.tax = "18";
          } else if (value === "Nil Rated") {
            updated.taxDescription = "Nil Rated";

            updated.sgstPerc = "0";
            updated.cgstPerc = "0";
            updated.igstPerc = "0";

            updated.tax = "0";
          } else if (value === "Exempted" || value === "Non-GST") {
            updated.taxDescription = value;

            updated.sgstPerc = "0";
            updated.cgstPerc = "0";
            updated.igstPerc = "0";

            updated.tax = "0";
          } else {
            updated.taxDescription = "";

            updated.sgstPerc = "";
            updated.cgstPerc = "";
            updated.igstPerc = "";

            updated.tax = "";
          }
        }

        if (field === "tax") {
          updated.tax = value;
        }

        return updated;
      }),
    );

    setRowErrors((previous) => ({
      ...previous,
      [`${id}-${field}`]: "",
    }));
  };

  /* ======================================================================== */
  /* TOTALS */
  /* ======================================================================== */

  const grossAmount = cashItems.reduce(
    (sum, row) => sum + (parseFloat(row.amount) || 0),
    0,
  );

  const taxTotal = taxRows.reduce(
    (sum, row) => sum + (parseFloat(row.revisedAmount || row.revisedAmt) || 0),
    0,
  );

  const discount = parseFloat(summary.discount) || 0;

  const afterDiscountTotal = grossAmount - discount;

  const finalTotal = afterDiscountTotal + taxTotal;

  /* ======================================================================== */
  /* TAX DETAIL */
  /* ======================================================================== */

  const addTaxRow = () => {
    setTaxRows((previous) => [...previous, createEmptyTaxRow()]);
  };

  const removeTaxRow = (id) => {
    setTaxRows((previous) =>
      previous.length <= 1 ? previous : previous.filter((row) => row.id !== id),
    );
  };

  const handleTaxRowChange = (id, field, value) => {
    setTaxRows((previous) =>
      previous.map((row) => {
        if (row.id !== id) {
          return row;
        }

        const updated = {
          ...row,
          [field]: value,
        };

        if (field === "particulars") {
          updated.taxId = value;
        }

        if (field === "taxPerc") {
          updated.tax = value;
        }

        if (field === "tax") {
          updated.taxPerc = value;
        }

        if (field === "particulars" || field === "tax" || field === "taxPerc") {
          const tax = parseFloat(updated.tax || updated.taxPerc) || 0;

          const revised = (grossAmount * tax) / 100;

          updated.acceptedQtyAmount = grossAmount.toFixed(2);

          updated.acceptedAmt = grossAmount.toFixed(2);

          updated.revisedAmount = revised.toFixed(2);

          updated.revisedAmt = revised.toFixed(2);
        }

        return updated;
      }),
    );
  };

  useEffect(() => {
    setTaxRows((previous) =>
      previous.map((row) => {
        if (row.tax === "" && row.taxPerc === "") {
          return row;
        }

        const tax = parseFloat(row.tax || row.taxPerc) || 0;

        const revised = (grossAmount * tax) / 100;

        return {
          ...row,

          acceptedQtyAmount: grossAmount.toFixed(2),

          acceptedAmt: grossAmount.toFixed(2),

          revisedAmount: revised.toFixed(2),

          revisedAmt: revised.toFixed(2),
        };
      }),
    );
  }, [grossAmount]);

  /* ======================================================================== */
  /* SUMMARY CALCULATION */
  /* ======================================================================== */

  useEffect(() => {
    setSummary((previous) => ({
      ...previous,

      basicAmount: grossAmount.toFixed(2),

      afterDiscountTotal: afterDiscountTotal.toFixed(2),

      totalAmount: finalTotal.toFixed(2),
    }));
  }, [grossAmount, afterDiscountTotal, finalTotal]);

  /* ======================================================================== */
  /* ATTACHMENTS */
  /* ======================================================================== */

  const addAttachment = () => {
    setAttachments((previous) => [
      ...previous,
      {
        id: Date.now() + Math.random(),
        file: null,
      },
    ]);
  };

  const removeAttachment = (id) => {
    setAttachments((previous) =>
      previous.length <= 1 ? previous : previous.filter((row) => row.id !== id),
    );
  };

  const handleAttachmentChange = (id, file) => {
    setAttachments((previous) =>
      previous.map((row) =>
        row.id !== id
          ? row
          : {
              ...row,
              file,
            },
      ),
    );
  };

  /* ======================================================================== */
  /* VALIDATION */
  /* ======================================================================== */

  const validate = () => {
    const errors = {};

    if (!form.branch) {
      errors.branch = "Plant ID is required";
    }

    if (!form.invDate) {
      errors.invDate = "Bill Date is required";
    }

    if (!form.supplierCode) {
      errors.supplierCode = "Supplier Code is required";
    }

    if (!form.issueTo) {
      errors.issueTo = "Issue To is required";
    }

    const itemErrs = {};

    cashItems.forEach((row) => {
      if (!String(row.itemCode || "").trim()) {
        itemErrs[`${row.id}-itemCode`] = "Item Code is required";
      }
    });

    setFieldErrors(errors);
    setRowErrors(itemErrs);

    return (
      Object.keys(errors).length === 0 && Object.keys(itemErrs).length === 0
    );
  };

  /* ======================================================================== */
  /* BUILD PAYLOAD */
  /* ======================================================================== */

  const buildPayload = () => {
    const directPurchaseCashDetailsDTO = cashItems
      .filter((row) => String(row.itemCode || "").trim())
      .map((row) => ({
        dcQty: toNumber(row.dcQty || row.qty),

        hsnCode: row.hsnCode || row.hsn || "",

        itemCode: row.itemCode || "",

        itemDescription: row.itemDescription || row.description || "",

        rate: toNumber(row.rate),

        receivedQty: toNumber(row.receivedQty),

        tax: toNumber(row.tax || row.taxPerc),

        taxType: row.taxType || "",

        unit: toInteger(row.unit),
      }));

    const directPurchaseTaxDetailsDTO = taxRows
      .filter((row) => String(row.particulars || "").trim())
      .map((row) => ({
        acceptedQtyAmount: toNumber(row.acceptedQtyAmount || row.acceptedAmt),

        particulars: row.particulars,

        revisedAmount: toNumber(row.revisedAmount || row.revisedAmt),

        tax: toNumber(row.tax || row.taxPerc),

        taxId: row.taxId || row.particulars,
      }));

    /*
     * IMPORTANT:
     *
     * belongsTo is the LOV DESCRIPTION.
     *
     * Example:
     * "Domestic"
     * "Import"
     *
     * Do NOT convert it to Number().
     */

    const payload = {
      active: form.active !== false,

      belongsTo: form.belongsTo || "Domestic",

      branch: toInteger(form.branch),

      id: isEditMode ? toInteger(form.id) : undefined,

      cancelRemarks: form.cancelRemarks || "",

      createdBy: isEditMode ? form.createdBy || USER_NAME : USER_NAME,

      dealerType: form.dealerType || "",

      directPurchaseCashDetailsDTO,

      directPurchaseTaxDetailsDTO,

      eccNoStNo: form.eccNoStNo || "",

      financialYear: form.financialYear || String(new Date().getFullYear()),

      gstState: toInteger(form.gstState),

      gstnNo: form.gstnNo || "",

      invDate: form.invDate || dayjs().format("YYYY-MM-DD"),

      invNo: form.invNo || "",

      isIgstApplicable: form.isIgstApplicable ? "Yes" : "No",

      isReverseCharge: form.reverseCharge ? "Yes" : "No",

      issueTo: form.issueTo || "",

      itemCategory: toInteger(form.itemCategory),

      orgId: ORG_ID,

      preparedBy: toInteger(form.preparedBy || summary.preparedBy),

      remarks: remarks || summary.remarks || "",

      suppType: form.suppType || "Local",

      supplierName: form.supplierName || "",

      taxStructure: form.taxStructure || "",

      tariffHeading: form.tariffHeading || "",

      creditAcName: form.creditAcName || "",

      subType: form.subType || "",

      tallyRefNo: form.tallyRefNo || "",

      gstStateCode: form.gstStateCode || "",

      supplierCode: form.supplierCode || "",

      basicAmount: toNumber(summary.basicAmount || grossAmount),

      discount: toNumber(summary.discount),

      afterDiscountTotal: toNumber(
        summary.afterDiscountTotal || afterDiscountTotal,
      ),

      totalAmount: toNumber(summary.totalAmount || finalTotal),
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    return payload;
  };

  /* ======================================================================== */
  /* SAVE */
  /* ======================================================================== */

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();

      const files = attachments
        .filter((attachment) => attachment?.file instanceof File)
        .map((attachment) => attachment.file);

      const finalFiles = Array.isArray(files) ? files : [];

      console.log("========== DIRECT PURCHASE FINAL PAYLOAD ==========");

      console.log(JSON.stringify(payload, null, 2));

      console.log("========== DIRECT PURCHASE FILES ==========");

      console.log(finalFiles);

      const response = await directPurchaseAPI.createUpdateDirectPurchase(
        payload,
        finalFiles,
      );

      const status =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.statusFlag === "Success";

      if (status) {
        addToast(
          isEditMode
            ? "Direct Purchase Updated Successfully!"
            : "Direct Purchase Saved Successfully!",
          "success",
        );

        onBack();
      } else {
        const errorMessage =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save direct purchase";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error saving direct purchase:", error);

      console.error("API ERROR RESPONSE:", error?.response?.data);

      addToast(
        error?.response?.data?.message ||
          error?.response?.data?.errorMessage ||
          "Failed to save Direct Purchase.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ======================================================================== */
  /* TABS */
  /* ======================================================================== */

  const tabs = [
    {
      key: "cashDetail",
      label: "Cash Detail",
    },
    {
      key: "taxDetails",
      label: "Tax Details",
    },
    {
      key: "summary",
      label: "Summary",
    },
    {
      key: "attachments",
      label: "Attached Invoice Copy",
    },
  ];

  /* ======================================================================== */
  /* CASH DETAIL TAB */
  /* ======================================================================== */

  const renderCashDetailTab = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>Cash Detail</SectionHeader>

        <button
          type="button"
          onClick={addCashItem}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {[
                "#",
                "Item Code",
                "Item Description",
                "HSN/SAC Code",
                "Tax Type",
                "Tax (%)",
                "Unit",
                "DC Qty",
                "Received Qty",
                "Rate",
                "Tax Description",
                "Amount",
                "SGST Rate",
                "SGST Amount",
                "CGST Rate",
                "CGST Amount",
                "IGST Rate",
                "IGST Amount",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  className="px-1.5 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {cashItems.map((row, index) => (
              <tr
                key={row.id}
                className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-1.5 py-1 text-gray-500 dark:text-gray-400">
                  {index + 1}
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.itemCode}
                    onChange={(e) =>
                      handleCashItemChange(row.id, "itemCode", e.target.value)
                    }
                    className={`${controlClasses} w-[100px] ${
                      rowErrors[`${row.id}-itemCode`] ? "border-red-500" : ""
                    }`}
                  />

                  {rowErrors[`${row.id}-itemCode`] && (
                    <p className="text-[10px] text-red-500">
                      {rowErrors[`${row.id}-itemCode`]}
                    </p>
                  )}
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.itemDescription}
                    onChange={(e) =>
                      handleCashItemChange(
                        row.id,
                        "itemDescription",
                        e.target.value,
                      )
                    }
                    className={`${controlClasses} w-[130px]`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.hsnCode}
                    onChange={(e) =>
                      handleCashItemChange(row.id, "hsnCode", e.target.value)
                    }
                    className={`${controlClasses} w-[100px]`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <select
                    value={row.taxType}
                    onChange={(e) =>
                      handleCashItemChange(row.id, "taxType", e.target.value)
                    }
                    className={`${controlClasses} w-[95px]`}
                  >
                    <option value="">Select</option>

                    {TAX_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.tax}
                    readOnly
                    className={`${controlClasses} w-[55px] bg-gray-50 dark:bg-gray-800`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <select
                    value={row.unit}
                    onChange={(e) =>
                      handleCashItemChange(row.id, "unit", e.target.value)
                    }
                    className={`${controlClasses} w-[65px]`}
                  >
                    <option value="">-</option>

                    {unitOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="number"
                    value={row.dcQty}
                    onChange={(e) =>
                      handleCashItemChange(row.id, "dcQty", e.target.value)
                    }
                    className={`${controlClasses} w-[70px]`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="number"
                    value={row.receivedQty}
                    onChange={(e) =>
                      handleCashItemChange(
                        row.id,
                        "receivedQty",
                        e.target.value,
                      )
                    }
                    className={`${controlClasses} w-[80px]`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="number"
                    step="0.01"
                    value={row.rate}
                    onChange={(e) =>
                      handleCashItemChange(row.id, "rate", e.target.value)
                    }
                    className={`${controlClasses} w-[80px]`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.taxDescription}
                    onChange={(e) =>
                      handleCashItemChange(
                        row.id,
                        "taxDescription",
                        e.target.value,
                      )
                    }
                    className={`${controlClasses} w-[95px]`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.amount}
                    readOnly
                    className={`${controlClasses} w-[85px] bg-gray-50 dark:bg-gray-800`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.sgstPerc}
                    readOnly
                    className={`${controlClasses} w-[60px] bg-gray-50 dark:bg-gray-800`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.sgstAmount}
                    readOnly
                    className={`${controlClasses} w-[80px] bg-gray-50 dark:bg-gray-800`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.cgstPerc}
                    readOnly
                    className={`${controlClasses} w-[60px] bg-gray-50 dark:bg-gray-800`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.cgstAmount}
                    readOnly
                    className={`${controlClasses} w-[80px] bg-gray-50 dark:bg-gray-800`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.igstPerc}
                    readOnly
                    className={`${controlClasses} w-[60px] bg-gray-50 dark:bg-gray-800`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.igstAmount}
                    readOnly
                    className={`${controlClasses} w-[80px] bg-gray-50 dark:bg-gray-800`}
                  />
                </td>

                <td className="px-1.5 py-1 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => copyCashItem(row)}
                      className="p-0.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Copy row"
                    >
                      <Copy className="h-3 w-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeCashItem(row.id)}
                      disabled={cashItems.length <= 1}
                      className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30"
                      title="Delete row"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end text-[11px] text-gray-500 dark:text-gray-400">
        Gross Amount:
        <span className="font-semibold ml-1">{grossAmount.toFixed(2)}</span>
      </div>
    </div>
  );

  /* ======================================================================== */
  /* TAX DETAILS TAB */
  /* ======================================================================== */

  const renderTaxDetailsTab = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>Tax Details</SectionHeader>

        <button
          type="button"
          onClick={addTaxRow}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add Tax Row
        </button>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {[
                "#",
                "Particulars",
                "Tax ID",
                "Tax %",
                "Accepted Qty Amount",
                "Revised Amount",
                "Ledger Account Name",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  className="px-1.5 py-1 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {taxRows.map((row, index) => (
              <tr
                key={row.id}
                className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-1.5 py-1 text-gray-500 dark:text-gray-400">
                  {index + 1}
                </td>

                <td className="px-1.5 py-1">
                  <select
                    value={row.particulars}
                    onChange={(e) =>
                      handleTaxRowChange(row.id, "particulars", e.target.value)
                    }
                    className={`${controlClasses} w-[100px]`}
                  >
                    <option value="">Select</option>

                    {PARTICULARS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="text"
                    value={row.taxId}
                    onChange={(e) =>
                      handleTaxRowChange(row.id, "taxId", e.target.value)
                    }
                    className={`${controlClasses} w-[80px]`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="number"
                    value={row.taxPerc || row.tax}
                    onChange={(e) =>
                      handleTaxRowChange(row.id, "taxPerc", e.target.value)
                    }
                    className={`${controlClasses} w-[60px]`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="number"
                    step="0.01"
                    value={row.acceptedQtyAmount || row.acceptedAmt}
                    readOnly
                    className={`${controlClasses} w-[120px] bg-gray-50 dark:bg-gray-800`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <input
                    type="number"
                    step="0.01"
                    value={row.revisedAmount || row.revisedAmt}
                    readOnly
                    className={`${controlClasses} w-[120px] bg-gray-50 dark:bg-gray-800`}
                  />
                </td>

                <td className="px-1.5 py-1">
                  <select
                    value={row.ledgerAcName}
                    onChange={(e) =>
                      handleTaxRowChange(row.id, "ledgerAcName", e.target.value)
                    }
                    className={`${controlClasses} w-[130px]`}
                  >
                    <option value="">Select</option>

                    {LEDGER_ACCOUNT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-1.5 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeTaxRow(row.id)}
                    disabled={taxRows.length <= 1}
                    className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-4 text-[11px] text-gray-500 dark:text-gray-400">
        <span>
          Gross:
          <strong className="ml-1">{grossAmount.toFixed(2)}</strong>
        </span>

        <span>
          Tax:
          <strong className="ml-1">{taxTotal.toFixed(2)}</strong>
        </span>
      </div>
    </div>
  );

  /* ======================================================================== */
  /* SUMMARY TAB */
  /* ======================================================================== */

  const renderSummaryTab = () => (
    <div className="space-y-3">
      <SectionHeader>Summary</SectionHeader>

      <div className={fieldGrid}>
        <div>
          <label className={labelClasses}>Basic Amount</label>

          <input
            type="text"
            value={summary.basicAmount}
            readOnly
            className={`${controlClasses} bg-gray-50 dark:bg-gray-800`}
          />
        </div>

        <div>
          <label className={labelClasses}>Discount</label>

          <input
            type="number"
            step="0.01"
            value={summary.discount}
            onChange={(e) =>
              setSummary((previous) => ({
                ...previous,
                discount: e.target.value,
              }))
            }
            className={controlClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>After Discount Total Amount</label>

          <input
            type="text"
            value={summary.afterDiscountTotal}
            readOnly
            className={`${controlClasses} bg-gray-50 dark:bg-gray-800`}
          />
        </div>

        <div>
          <label className={labelClasses}>Total Amount</label>

          <input
            type="text"
            value={summary.totalAmount}
            readOnly
            className={`${controlClasses} bg-gray-50 dark:bg-gray-800`}
          />
        </div>

        <div>
          <label className={labelClasses}>Prepared By</label>

          <select
            value={summary.preparedBy}
            onChange={(e) =>
              setSummary((previous) => ({
                ...previous,
                preparedBy: e.target.value,
              }))
            }
            className={controlClasses}
          >
            <option value="">Select</option>

            {employeeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <label className={labelClasses}>Remarks</label>

          <textarea
            value={summary.remarks}
            onChange={(e) => {
              setSummary((previous) => ({
                ...previous,
                remarks: e.target.value,
              }));

              setRemarks(e.target.value);
            }}
            rows={2}
            className={`${controlClasses} h-auto min-h-[30px] resize-none pt-1`}
          />
        </div>
      </div>
    </div>
  );

  /* ======================================================================== */
  /* ATTACHMENTS TAB */
  /* ======================================================================== */

  const renderAttachmentsTab = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>Attached Invoice Copy</SectionHeader>

        <button
          type="button"
          onClick={addAttachment}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add Document
        </button>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-1 w-8 text-center dark:text-white">#</th>

              <th className="p-1 text-left dark:text-white">Invoice Copy</th>

              <th className="p-1 w-20 text-left dark:text-white">Action</th>
            </tr>
          </thead>

          <tbody>
            {attachments.map((attachment, index) => (
              <tr
                key={attachment.id}
                className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="p-1 text-center font-medium dark:text-white">
                  {index + 1}
                </td>

                <td className="p-1">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.zip,.rar,.txt"
                    className="w-full h-9 text-xs file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded px-2"
                    onChange={(e) =>
                      handleAttachmentChange(
                        attachment.id,
                        e.target.files?.[0] || null,
                      )
                    }
                  />

                  {attachment.file && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      {attachment.file.name}
                    </p>
                  )}
                </td>

                <td className="p-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.id)}
                    disabled={attachments.length <= 1}
                    className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                      attachments.length <= 1
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <Trash2 size={10} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-gray-400">
        If no invoice copy is selected, the save request sends an empty file
        list.
      </p>
    </div>
  );

  /* ======================================================================== */
  /* RENDER */
  /* ======================================================================== */

  return (
    <div className="animate-fadeIn px-3 py-3 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Direct Purchase" : "New Direct Purchase"}
        </h2>

        <div className="ml-auto flex items-center gap-2">
          <label className={labelClasses}>Active</label>

          <ToggleButton
            value={form.active}
            onChange={(value) =>
              setForm((previous) => ({
                ...previous,
                active: value,
              }))
            }
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <SectionHeader>Direct Purchase</SectionHeader>

        <div className={fieldGrid}>
          {/* Plant ID */}

          <div>
            <label className={labelClasses}>
              Plant ID <span className="text-red-500">*</span>
            </label>

            <select
              name="branch"
              value={form.branch}
              onChange={handleFormChange}
              className={`${controlClasses} ${
                fieldErrors.branch ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>

              {branchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {fieldErrors.branch && (
              <p className="text-[10px] text-red-500 mt-0.5">
                {fieldErrors.branch}
              </p>
            )}
          </div>

          {/* Doc No */}

          <div>
            <label className={labelClasses}>Doc No</label>

            <input
              type="text"
              value={generatingDocId ? "Generating..." : form.invNo}
              disabled
              className={controlClasses}
            />
          </div>

          {/* GST State */}

          <div>
            <label className={labelClasses}>GST State</label>

            <select
              name="gstState"
              value={form.gstState}
              onChange={handleFormChange}
              className={controlClasses}
            >
              <option value="">Select</option>

              {gstStateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Belongs To - LOV API */}

          <div>
            <label className={labelClasses}>Belongs To</label>

            <select
              name="belongsTo"
              value={form.belongsTo}
              onChange={handleFormChange}
              className={controlClasses}
            >
              <option value="">Select</option>

              {belongsToOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Doc Date */}

          <div>
            <label className={labelClasses}>Doc Date</label>

            <input
              type="date"
              name="invDate"
              value={form.invDate}
              onChange={handleFormChange}
              className={controlClasses}
            />
          </div>

          {/* GST State Code */}

          <div>
            <label className={labelClasses}>GST State Code</label>

            <input
              type="text"
              value={form.gstStateCode}
              disabled
              className={`${controlClasses} bg-gray-50 dark:bg-gray-800`}
            />
          </div>

          {/* Supplier Code */}

          <div>
            <label className={labelClasses}>
              Supplier Code <span className="text-red-500">*</span>
            </label>

            <select
              name="supplierCode"
              value={
                supplierOptions.find(
                  (option) =>
                    String(option.supplierCode) === String(form.supplierCode),
                )?.value || ""
              }
              onChange={handleFormChange}
              className={`${controlClasses} ${
                fieldErrors.supplierCode ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>

              {supplierOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {fieldErrors.supplierCode && (
              <p className="text-[10px] text-red-500 mt-0.5">
                {fieldErrors.supplierCode}
              </p>
            )}
          </div>

          {/* Supplier Name */}

          <div>
            <label className={labelClasses}>Supplier Name</label>

            <input
              type="text"
              value={form.supplierName}
              disabled
              className={controlClasses}
            />
          </div>

          {/* Invoice Date */}

          <div>
            <label className={labelClasses}>Inv Date</label>

            <input
              type="date"
              name="invDate"
              value={form.invDate}
              onChange={handleFormChange}
              className={controlClasses}
            />
          </div>

          {/* Issue To */}

          <div>
            <label className={labelClasses}>
              Issue To <span className="text-red-500">*</span>
            </label>

            <select
              name="issueTo"
              value={form.issueTo}
              onChange={handleFormChange}
              className={`${controlClasses} ${
                fieldErrors.issueTo ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>

              {issueToOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {fieldErrors.issueTo && (
              <p className="text-[10px] text-red-500 mt-0.5">
                {fieldErrors.issueTo}
              </p>
            )}
          </div>

          {/* GSTN */}

          <div>
            <label className={labelClasses}>GSTN No</label>

            <input
              type="text"
              name="gstnNo"
              value={form.gstnNo}
              onChange={handleFormChange}
              className={controlClasses}
            />
          </div>

          {/* Inv No */}

          <div>
            <label className={labelClasses}>Inv No</label>

            <input
              type="text"
              value={form.invNo}
              disabled
              className={controlClasses}
            />
          </div>

          {/* Dealer Type */}

          <div>
            <label className={labelClasses}>Dealer Type</label>

            <select
              name="dealerType"
              value={form.dealerType}
              onChange={handleFormChange}
              className={controlClasses}
            >
              <option value="">Select</option>

              {DEALER_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Item Category */}

          <div>
            <label className={labelClasses}>Item Category</label>

            <select
              name="itemCategory"
              value={form.itemCategory}
              onChange={handleFormChange}
              className={controlClasses}
            >
              <option value="">Select</option>

              {itemCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* ECC */}

          <div>
            <label className={labelClasses}>ECC No./S.T. No</label>

            <input
              type="text"
              name="eccNoStNo"
              value={form.eccNoStNo}
              onChange={handleFormChange}
              className={controlClasses}
            />
          </div>

          {/* Reverse Charge */}

          <div>
            <label className={labelClasses}>Is Reverse Chrg</label>

            <ToggleButton
              value={form.reverseCharge}
              onChange={(value) =>
                setForm((previous) => ({
                  ...previous,
                  reverseCharge: value,
                }))
              }
            />
          </div>

          {/* IGST */}

          <div>
            <label className={labelClasses}>Is IGST Applicable</label>

            <ToggleButton
              value={form.isIgstApplicable}
              onChange={(value) =>
                setForm((previous) => ({
                  ...previous,
                  isIgstApplicable: value,
                }))
              }
            />
          </div>
        </div>

        {/* ================================================================== */}
        {/* TABS */}
        {/* ================================================================== */}

        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "cashDetail" && renderCashDetailTab()}

        {activeTab === "taxDetails" && renderTaxDetailsTab()}

        {activeTab === "summary" && renderSummaryTab()}

        {activeTab === "attachments" && renderAttachmentsTab()}

        {/* ================================================================== */}
        {/* FOOTER */}
        {/* ================================================================== */}

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />

            {isSubmitting ? "Saving..." : data ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectPurchaseForm;
