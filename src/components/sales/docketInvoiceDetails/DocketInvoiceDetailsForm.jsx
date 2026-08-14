import { ArrowLeft, Save, X, Plus, Trash2, Copy } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import docketInvoiceDetailsAPI from "../../../api/Sales/docketInvoiceDetailsAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { useToast } from "../../Toast/ToastContext";
import transportAPI from "../../../api/transportAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-3 items-start";

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{children}</h3>
);

const InputField = ({ label, required, error, children }) => (
  <div>
    {label && <label className={labelClasses}>{label}{required && <span className="text-red-500"> *</span>}</label>}
    {children}
    {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
  </div>
);

const ToggleSwitch = ({ value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
    <span className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-0.5"}`} />
  </button>
);

const thClass = "px-1 py-0.5 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap text-[10px]";

const MODE_OPTIONS = ["Road", "Rail", "Air", "Sea"];

const getDefaultDocketRow = () => ({
  docketNo: "",
  docketDate: "",
  invoiceNo: "",
  qtyBoxes: "",
  weightBoxes: "",
  totalValue: "",
  cumulativeTotal: "",
  mode: "",
});

const getDefaultValues = () => ({
  id: 0,
  plantId: "",
  docNo: `DK/${dayjs().format("DDD")}/${String(Date.now()).slice(-4)}`,
  docDate: dayjs().format("YYYY-MM-DD"),
  transportId: "",
  transportName: "",
  billNo: "",
  billDate: "",
  totalAmount: "",
  active: true,
  docketDetails: [getDefaultDocketRow()],
});

const DocketInvoiceDetailsForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;
  const dataLoadedRef = useRef(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [plantOptions, setPlantOptions] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [transportLoading, setTransportLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control, handleSubmit, setValue, watch, register, reset,
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control, name: "docketDetails",
  });

  const watchRows = watch("docketDetails");
  const watchTransportId = watch("transportId");

  // Load plant options
  useEffect(() => {
    const loadOptions = async () => {
      setLookupLoading(true);
      try {
        if (isMacurex) {
          const res = await locationMasterAPI.getPlants(orgId);
          setPlantOptions((res || []).map((p) => ({ id: p.id, label: p.plantName || p.plantId || p.id })));
        } else {
          const res = await branchAPI.getBranchByOrgId(orgId);
          setPlantOptions((res || []).map((b) => ({ id: b.id, label: b.branchName || b.id })));
        }
      } catch (error) {
        console.error("Failed to load plant/branch options", error);
        setPlantOptions([]);
      } finally {
        setLookupLoading(false);
      }
    };
    if (orgId) loadOptions();
  }, [orgId, isMacurex]);

  // Load transports
  const loadTransports = useCallback(async () => {
    if (!orgId || !branch) return;

    setTransportLoading(true);
    try {
      const response = await transportAPI.getTransportByOrgId(branch, orgId);
      console.log("Transport API Response:", response);

      let transportList = [];
      if (response?.paramObjectsMap?.transportList) {
        transportList = response.paramObjectsMap.transportList;
      } else if (response?.data?.paramObjectsMap?.transportList) {
        transportList = response.data.paramObjectsMap.transportList;
      } else if (Array.isArray(response)) {
        transportList = response;
      }

      const options = transportList.map((item) => ({
        id: item.id,
        label: item.transportName || item.name || "Unknown Transport",
        address: item.address || "",
        branch: item.branch?.branchName || "",
        active: item.active === "Active" || item.active === true,
      }));

      setTransportOptions(options);
      console.log("Transport options:", options);
    } catch (error) {
      console.error("Failed to load transports:", error);
      setTransportOptions([]);
      addToast("Failed to fetch transport list", "error");
    } finally {
      setTransportLoading(false);
    }
  }, [branch, orgId, addToast]);

  // Load transports on component mount
  useEffect(() => {
    if (orgId && branch) {
      loadTransports();
    }
  }, [orgId, branch, loadTransports]);

  // Load data by ID when in edit mode
  const loadDataById = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await docketInvoiceDetailsAPI.getById(id);
      console.log("Get By ID Response:", response);

      if (response) {
        // Map the response to form fields
        const formData = {
          id: response.id || 0,
          plantId: response.branch?.id || "",
          docNo: response.docNo || `DK/${response.id}`,
          docDate: response.docDate || "",
          transportId: response.transport?.id || "",
          transportName: response.transport?.transportName || "",
          billNo: response.billNo || "",
          billDate: response.billDate || "",
          totalAmount: response.totalAmount || "",
          active: response.active === "Active" || response.active === true,
          docketDetails: (response.docketInvoiceDetResponseDTO || []).map((d) => ({
            docketNo: d.docketNo || "",
            docketDate: d.docketDate || "",
            invoiceNo: d.invoiceNo || "",
            qtyBoxes: d.noOfQty || "",
            weightBoxes: d.weight || "",
            totalValue: d.totalValue || "",
            cumulativeTotal: d.cumulativeValue || "",
            mode: d.mode || "",
          })),
        };

        // If no docket details, add one empty row
        if (formData.docketDetails.length === 0) {
          formData.docketDetails = [getDefaultDocketRow()];
        }

        reset(formData);
        dataLoadedRef.current = true;
      } else {
        console.error("No data found for ID:", id);
      }
    } catch (error) {
      console.error("Error loading data by ID:", error);
    } finally {
      setLoading(false);
    }
  }, [reset, addToast]);

  // Load data when in edit mode
  useEffect(() => {
    if (data?.id && data.id > 0 && !dataLoadedRef.current) {
      loadDataById(data.id);
    } else if (data && !dataLoadedRef.current) {
      // If data is passed directly (from list), populate form
      const formData = {
        id: data.id || 0,
        plantId: data.plantId || data.branchId || "",
        docNo: data.docNo || `DK/${data.id || Date.now()}`,
        docDate: data.docDate || "",
        transportId: data.transportId || "",
        transportName: data.transportName || "",
        billNo: data.billNo || "",
        billDate: data.billDate || "",
        totalAmount: data.totalAmount || "",
        active: data.active !== false,
        docketDetails: data.docketDetails?.length
          ? data.docketDetails.map((d) => ({
            docketNo: d.docketNo || "",
            docketDate: d.docketDate || "",
            invoiceNo: d.invoiceNo || "",
            qtyBoxes: d.qtyBoxes || "",
            weightBoxes: d.weightBoxes || "",
            totalValue: d.totalValue || "",
            cumulativeTotal: d.cumulativeTotal || "",
            mode: d.mode || "",
          }))
          : [getDefaultDocketRow()],
      };
      reset(formData);
      dataLoadedRef.current = true;
    }
  }, [data, loadDataById, reset]);

  // Auto-fill transport name when transportId changes
  useEffect(() => {
    if (watchTransportId && transportOptions.length > 0) {
      const selectedTransport = transportOptions.find(
        (t) => String(t.id) === String(watchTransportId)
      );
      if (selectedTransport) {
        setValue("transportName", selectedTransport.label, { shouldDirty: false });
      }
    }
  }, [watchTransportId, transportOptions, setValue]);

  const [formErrs, setFormErrs] = useState({});

  const computeCumulative = (rows) => {
    let running = 0;
    (rows || []).forEach((r, i) => {
      running += parseFloat(r?.totalValue) || 0;
      setValue(`docketDetails.${i}.cumulativeTotal`, running || "", { shouldDirty: false });
    });
  };

  const handleDocketChange = (idx, field, value, row) => {
    setValue(`docketDetails.${idx}.${field}`, value, { shouldDirty: true });
    if (field === "totalValue") {
      computeCumulative(watchRows);
    }
  };

  const copyRow = (idx) => {
    const row = watchRows?.[idx];
    if (row) append({ ...getDefaultDocketRow(), ...row });
  };

  const addRow = () => append(getDefaultDocketRow());

  const validate = () => {
    const errs = {};
    const vals = watch();
    if (!vals.plantId) errs.plantId = "Required";
    if (!vals.transportId) errs.transportId = "Required";
    (watchRows || []).forEach((r, i) => {
      if (!r.docketNo) errs[`docketDetails.${i}.docketNo`] = "Required";
    });
    return errs;
  };

  const onSubmit = async (formData) => {
    const errs = validate();
    setFormErrs(errs);
    if (Object.keys(errs).length) {
      addToast("Please fill all mandatory fields", "error");
      return;
    }
    computeCumulative(watchRows);

    // Get the form values
    const values = watch();

    // Build the payload according to the API specification
    const payload = {
      // Only include id if it exists and is > 0 (update mode)
      ...(values.id && values.id > 0 ? { id: values.id } : {}),
      orgId: orgId,
      branch: parseInt(values.plantId) || branch,
      transport: parseInt(values.transportId) || 0,
      totalAmount: parseFloat(values.totalAmount) || 0,
      billNo: values.billNo || "",
      billDate: values.billDate || "",
      active: true,
      cancelRemarks: "",
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      docketInvoiceDetailsDTO: (values.docketDetails || [])
        .filter(d => d.docketNo) // Only include rows with docket number
        .map(d => ({
          docketNo: d.docketNo || "",
          docketDate: d.docketDate || "",
          invoiceNo: d.invoiceNo || "",
          noOfQty: parseFloat(d.qtyBoxes) || 0,
          weight: parseFloat(d.weightBoxes) || 0,
          totalValue: parseFloat(d.totalValue) || 0,
          cumulativeValue: parseFloat(d.cumulativeTotal) || 0,
          mode: d.mode || "",
        })),
    };

    console.log("Sending payload:", payload);

    try {
      const response = await docketInvoiceDetailsAPI.createUpdate(payload);
      console.log("API Response:", response);

      if (response?.status) {
        addToast(
          data?.id && data.id > 0
            ? "Docket/Invoice Details Updated Successfully!"
            : "Docket/Invoice Details Saved Successfully!",
          "success"
        );
        onBack();
      } else {
        addToast(response?.message || "Failed to save Docket/Invoice Details.", "error");
      }
    } catch (error) {
      console.error("Save error:", error);
      addToast(error?.response?.data?.message || "Failed to save Docket/Invoice Details.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading data...</div>
      </div>
    );
  }

  const renderHeader = (errMap) => (
    <div className={fieldGrid}>
      <InputField label={isMacurex ? "Plant ID" : "Branch"} required error={errMap.plantId}>
        <Controller control={control} name="plantId" render={({ field }) => (
          <select {...field} disabled={lookupLoading} className={`${controlClasses} ${errMap.plantId ? "border-red-500" : ""}`}>
            <option value="">{isMacurex ? "Select" : "Select Branch"}</option>
            {plantOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        )} />
      </InputField>
      <InputField label="Doc No">
        <input {...register("docNo")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>
      <InputField label="Doc Date">
        <input type="date" {...register("docDate")} className={controlClasses} />
      </InputField>
      <InputField label="Transport" required error={errMap.transportId}>
        <Controller control={control} name="transportId" render={({ field }) => (
          <select
            {...field}
            disabled={transportLoading}
            className={`${controlClasses} ${errMap.transportId ? "border-red-500" : ""}`}
          >
            <option value="">Select Transport</option>
            {transportOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label} {o.address ? `- ${o.address}` : ""}
              </option>
            ))}
          </select>
        )} />
        {transportLoading && (
          <p className="text-[10px] text-gray-400 mt-0.5">Loading transports...</p>
        )}
      </InputField>
      <InputField label="Bill No">
        <input {...register("billNo")} className={controlClasses} />
      </InputField>
      <InputField label="Bill Date">
        <input type="date" {...register("billDate")} className={controlClasses} />
      </InputField>
      <InputField label="Total Amount">
        <input type="number" step="0.01" {...register("totalAmount")} className={controlClasses} />
      </InputField>
    </div>
  );

  const docketColumns = [
    { key: "docketNo", label: "Docket No", width: "110px", required: true },
    { key: "docketDate", label: "Docket Date", width: "110px" },
    { key: "invoiceNo", label: "Invoice No", width: "100px" },
    { key: "qtyBoxes", label: "No. of Qty/Box", width: "100px" },
    { key: "weightBoxes", label: "Weight/No. of Box", width: "110px" },
    { key: "totalValue", label: "Total Value", width: "90px" },
    { key: "cumulativeTotal", label: "Cumulative Total", width: "110px" },
    { key: "mode", label: "Mode", width: "90px" },
  ];

  const renderDocketCell = (col, row, idx, cumulativeRows) => {
    const base = `docketDetails.${idx}.`;
    const cls = `${controlClasses} w-[${col.width}]`;

    if (col.key === "cumulativeTotal") {
      return <input value={cumulativeRows?.[idx] ?? ""} readOnly className={`${cls} bg-gray-50 dark:bg-gray-800`} />;
    }
    if (col.key === "mode") {
      return (
        <Controller control={control} name={`${base}${col.key}`} render={({ field }) => (
          <select {...field} onChange={(e) => handleDocketChange(idx, col.key, e.target.value, row)} className={`${controlClasses} w-[${col.width}]`}>
            <option value="">Select</option>
            {MODE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )} />
      );
    }
    if (col.key === "docketDate") {
      return (
        <input type="date" defaultValue={row?.[col.key] ?? ""}
          onChange={(e) => handleDocketChange(idx, col.key, e.target.value, row)} className={cls} />
      );
    }
    const numericFields = ["qtyBoxes", "weightBoxes", "totalValue"];
    return (
      <input
        type={numericFields.includes(col.key) ? "number" : "text"}
        step="0.01"
        defaultValue={row?.[col.key] ?? ""}
        onChange={(e) => handleDocketChange(idx, col.key, e.target.value, row)}
        className={cls}
      />
    );
  };

  const getCumulative = () => {
    const cumulative = [];
    let running = 0;
    (watchRows || []).forEach((r) => {
      running += parseFloat(r?.totalValue) || 0;
      cumulative.push(running || "");
    });
    return cumulative;
  };

  const renderDocketTab = (errMap) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionHeader>Docket Details</SectionHeader>
        <button type="button" onClick={addRow}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
          <Plus className="h-3 w-3" /> Add Row
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className={thClass}>#</th>
              {docketColumns.map((c) => (
                <th key={c.key} className={thClass} style={{ minWidth: c.width }}>
                  {c.label}{c.required && <span className="text-red-500"> *</span>}
                </th>
              ))}
              <th className={`${thClass} text-center`} style={{ minWidth: "50px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((row, idx) => (
              <tr key={row.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-1.5 py-1 text-gray-500 dark:text-gray-400 text-[10px] w-[25px]">{idx + 1}</td>
                {docketColumns.map((col) => (
                  <td key={col.key} className="px-1.5 py-1" style={{ minWidth: col.width }}>
                    {renderDocketCell(col, watchRows?.[idx], idx, getCumulative())}
                    {errMap[`docketDetails.${idx}.${col.key}`] && (
                      <p className="text-[9px] text-red-500 leading-none mt-0.5">{errMap[`docketDetails.${idx}.${col.key}`]}</p>
                    )}
                  </td>
                ))}
                <td className="px-1.5 py-1 text-center whitespace-nowrap w-[50px]">
                  <div className="flex items-center justify-center gap-0.5">
                    <button type="button" onClick={() => copyRow(idx)}
                      className="p-0.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Copy className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => remove(idx)} disabled={fields.length <= 1}
                      className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn px-3 py-3 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <button type="button" onClick={onBack} className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data?.id && data.id > 0 ? "Edit Docket/Invoice Details" : "New Docket/Invoice Details"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
        <SectionHeader>Docket Header</SectionHeader>
        {renderHeader(formErrs)}
        {renderDocketTab(formErrs)}

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <X className="h-3 w-3" /> Cancel
          </button>
          <button type="button" onClick={handleSubmit(onSubmit)}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors">
            <Save className="h-3 w-3" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocketInvoiceDetailsForm;