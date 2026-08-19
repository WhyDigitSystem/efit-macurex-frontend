import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import branchAPI from "../../../api/branchAPI";
import transportBillAPI from "../../../api/Sales/transportBillAPI";
import { useToast } from "../../Toast/ToastContext";
import transportAPI from "../../../api/transportAPI";
import employeeAPI from "../../../api/employeeAPI";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const getDefaultPaymentRow = () => ({
  chequeRtgsNo: "",
  chequeDate: "",
  totalAmount: "",
  paidAmount: "",
  pendingAmount: "",
});

const getDefaultValues = (data) => ({
  plantId: data?.plantId || "",
  docNo: data?.docNo || "",
  transportName: data?.transportName || "",
  docDate: data?.docDate || "",
  billNo: data?.billNo || "",
  billDate: data?.billDate || "",
  totalAmount: data?.totalAmount ?? "",
  billReceivedDate: data?.billReceivedDate || "",
  accReceivedDate: data?.accReceivedDate || "",
  receivedBy: data?.receivedBy || "",
  accReceivedBy: data?.accReceivedBy || "",
  active: data?.active === "Active" || data?.active !== false,
  id: data?.id || 0,
  paymentDetails1: data?.paymentDetails1?.length
    ? data.paymentDetails1.map((r) => ({
        chequeRtgsNo: r.chequeRtgsNo || r.chequeNo || "",
        chequeDate: r.chequeDate || "",
        totalAmount: r.totalAmount ?? "",
        paidAmount: r.paidAmount ?? "",
        pendingAmount: r.pendingAmount ?? "",
      }))
    : [getDefaultPaymentRow()],
});

const SelectField = ({
  control,
  name,
  label,
  options,
  required,
  errors,
  onChange,
  disabled,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
          >
            <option value="">Select an option</option>
            {options.map((opt) => (
              <option
                key={typeof opt === "object" ? opt.value : opt}
                value={typeof opt === "object" ? opt.value : opt}
              >
                {typeof opt === "object" ? opt.label : opt}
              </option>
            ))}
          </select>
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px]">{errorMessage}</p>
      )}
    </div>
  );
};

// Input Field Component
const InputField = ({
  control,
  name,
  label,
  type = "text",
  required,
  placeholder,
  errors,
  disabled,
  step,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{
          ...(required && {
            required: `${label} is required`,
          }),
        }}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px]">{errorMessage}</p>
      )}
    </div>
  );
};

// Table Cell Components
const InputCell = ({
  control,
  name,
  type = "text",
  step,
  placeholder,
  required,
  errors,
  align = "left",
  disabled,
  onChange,
  readOnly = false,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <div className="p-0.5 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} h-7 text-[10px] ${align === "right" ? "text-right" : ""} ${
              errorMessage ? "border-red-500 focus:border-red-500" : ""
            }`}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e);
              }
            }}
          />
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[9px] mt-0.5 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

const ToggleSwitch = ({ value, onChange }) => (
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

// Main Component
const TransportBillForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branchId = Number(localStorage.getItem("branchId"));

  const [activeTab, setActiveTab] = useState("payment1");
  const [plantData, setPlantData] = useState([]);
  const [transporterData, setTransporterData] = useState([]);
  const [receivedByData, setReceivedByData] = useState([]);
  const [formErrs, setFormErrs] = useState({});
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(data),
  });

  const {
    fields: fields1,
    append: append1,
    remove: remove1,
    replace: replace1,
  } = useFieldArray({
    control,
    name: "paymentDetails1",
  });

  const watch1 = watch("paymentDetails1");

  // Load branches for Plant ID
  useEffect(() => {
    loadBranches();
    loadTransporter();
    loadReceivedBy();
  }, []);

  // Fetch data by ID when editing
  useEffect(() => {
    const fetchData = async () => {
      if (data?.id) {
        setLoading(true);
        try {
          const response = await transportBillAPI.getById(data.id);
          if (response) {
            // Map the response to form fields
            const formData = {
              id: response.id || 0,
              plantId: response.branch?.id || "",
              docNo: response.docNo || "",
              docDate: response.docDate || "",
              transportName: response.transportName?.id || "",
              billNo: response.billNo || "",
              billDate: response.billDate || "",
              totalAmount: response.totalAmount || "",
              billReceivedDate: response.billReceivedDate || "",
              accReceivedDate: response.accReceivedDate || "",
              receivedBy: response.receivedBy?.employeeId || "",
              accReceivedBy: response.accReceivedBy?.employeeId || "",
              active: response.active === true || response.active === "Active",
              paymentDetails1: response.paymentDetails1?.length
                ? response.paymentDetails1.map((item) => ({
                    chequeRtgsNo: item.chequeRtgsNo || "",
                    chequeDate: item.chequeDate || "",
                    totalAmount: item.totalAmount || "",
                    paidAmount: item.paidAmount || "",
                    pendingAmount: item.pendingAmount || "",
                  }))
                : [getDefaultPaymentRow()],
            };

            reset(getDefaultValues(formData));

            // Update the field array with the fetched data
            if (response.paymentDetails1?.length) {
              const paymentRows = response.paymentDetails1.map((item) => ({
                chequeRtgsNo: item.chequeRtgsNo || "",
                chequeDate: item.chequeDate || "",
                totalAmount: item.totalAmount || "",
                paidAmount: item.paidAmount || "",
                pendingAmount: item.pendingAmount || "",
              }));
              replace1(paymentRows);
            }
          }
        } catch (error) {
          console.error("Error fetching transport bill data:", error);
          addToast("Failed to load transport bill data", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [data?.id]);

  const [generatingDocId, setGeneratingDocId] = useState(false);
  useEffect(() => {
    // Don't regenerate the doc number while editing
    if (data?.id) return;

    const generateDocNo = async () => {
      setGeneratingDocId(true);
      setValue("docNo", "");

      try {
        if (!orgId || !branchId) {
          console.error("OrgId or BranchId missing");
          return;
        }

        const mappingList =
          await docTypeMappingAPI.getDocumentTypeMappingByOrgId(
            orgId,
            branchId,
          );

        const record = mappingList?.[0];
        const tbDetail = record?.documentTypeMappingDetails?.find(
          (d) => d.screenCode === "TB",
        );

        if (!tbDetail) {
          console.error(
            "Transport Bill document mapping not found for screenCode TB",
          );
          addToast(
            "No document type mapping found for Transport Bill (TB)",
            "error",
          );
          return;
        }

        const docId = await transportBillAPI.getTransportBillDocId({
          financialYear: tbDetail.finYear,
          orgId: tbDetail.orgId,
          screenCode: tbDetail.screenCode,
        });

        if (docId) {
          setValue("docNo", docId);
        } else {
          addToast("Failed to generate Doc No", "error");
        }
      } catch (error) {
        console.error("Error generating transport bill doc number:", error);
        addToast("Failed to generate Doc No", "error");
      } finally {
        setGeneratingDocId(false);
      }
    };

    generateDocNo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      const options = (response || []).map((branch) => ({
        value: branch.id,
        label: branch.branchName || branch.branch,
      }));
      setPlantData(options);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setPlantData([]);
    }
  }, [orgId]);

  const loadTransporter = useCallback(async () => {
    try {
      const response = await transportAPI.getTransportByOrgId(branchId, orgId);
      const options = (response || []).map((transport) => ({
        value: transport.id,
        label: transport.transportName,
      }));
      setTransporterData(options);
    } catch (error) {
      console.error("Failed to load transporters:", error);
      setTransporterData([]);
    }
  }, [branchId, orgId]);

  const loadReceivedBy = useCallback(async () => {
    try {
      const response = await employeeAPI.getEmployeeByOrgId(orgId);
      const options = (response || []).map((employee) => ({
        value: employee.id || employee.employeeId,
        label: employee.employeeName,
      }));
      setReceivedByData(options);
    } catch (error) {
      console.error("Failed to load received by options:", error);
      setReceivedByData([]);
    }
  }, [orgId]);

  const handlePaymentChange = (setName, idx, field, value, row) => {
    const base = `${setName}.${idx}.`;
    setValue(`${base}${field}`, value, { shouldDirty: true });
    if (["totalAmount", "paidAmount"].includes(field)) {
      const total =
        parseFloat(field === "totalAmount" ? value : row?.totalAmount) || 0;
      const paid =
        parseFloat(field === "paidAmount" ? value : row?.paidAmount) || 0;
      const pending = Math.max(0, total - paid);
      setValue(`${base}pendingAmount`, pending || "", { shouldDirty: true });
    }
  };

  const validate = () => {
    const errs = {};
    const vals = watch();
    if (!vals.plantId) errs.plantId = "Required";
    if (!vals.transportName) errs.transportName = "Required";
    if (!vals.billNo) errs.billNo = "Required";
    if (!vals.billDate) errs.billDate = "Required";
    if (
      vals.totalAmount === "" ||
      vals.totalAmount === undefined ||
      Number(vals.totalAmount) <= 0
    ) {
      errs.totalAmount = "Required";
    }
    return errs;
  };

  const onSubmit = async (formData) => {
    const errs = validate();
    setFormErrs(errs);
    if (Object.keys(errs).length) {
      addToast("Please fill all mandatory fields", "error");
      return;
    }

    // Build payment details array
    const paymentDetails = (formData.paymentDetails1 || []).map((item) => ({
      chequeRtgsNo: item.chequeRtgsNo || "",
      chequeDate: item.chequeDate || "",
      totalAmount: parseFloat(item.totalAmount) || 0,
      paidAmount: parseFloat(item.paidAmount) || 0,
      pendingAmount: parseFloat(item.pendingAmount) || 0,
    }));

    // Base payload without id
    const payload = {
      orgId: orgId,
      branch: formData.plantId || branchId,
      docNo: formData.docNo || "",
      docDate: formData.docDate || "",
      transportName: Number(formData.transportName) || 0,
      billNo: formData.billNo || "",
      billDate: formData.billDate || "",
      totalAmount: parseFloat(formData.totalAmount) || 0,
      billReceivedDate: formData.billReceivedDate || "",
      accReceivedDate: formData.accReceivedDate || "",
      receivedBy: Number(formData.receivedBy) || 0,
      accReceivedBy: Number(formData.accReceivedBy) || 0,
      active: formData.active === true || formData.active === "Active",
      createdBy: Number(localStorage.getItem("userId")) || 0,
      cancelRemarks: "",
      documentType: 0,
      paymentDetails1: paymentDetails,
    };

    // Only add id if it exists (for update)
    if (formData.id && formData.id !== 0) {
      payload.id = formData.id;
    }

    console.log("Saving payload:", payload);

    try {
      const response = await transportBillAPI.createUpdate(payload);
      if (response?.status === true || response?.status === "Ok") {
        addToast(
          data ? "Transport Bill Updated!" : "Transport Bill Saved!",
          "success",
        );
        onBack();
      } else {
        addToast(
          response?.message || "Failed to save Transport Bill.",
          "error",
        );
      }
    } catch (error) {
      console.error("Save error:", error);
      addToast(
        error?.response?.data?.message || "Failed to save Transport Bill.",
        "error",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const tabs = [{ key: "payment1", label: "Payment Details 1" }];

  return (
    <div className="p-2 max-w-7xl relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Transport Bill" : "Add Transport Bill"}
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <label className={labelClasses}>Active</label>
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <ToggleSwitch value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <SelectField
            control={control}
            name="plantId"
            label="Plant ID"
            options={plantData}
            required
            errors={formErrs}
          />
          <InputField
            control={control}
            name="docNo"
            label="Doc No"
            errors={errors}
            disabled
            placeholder={generatingDocId ? "Generating..." : "Auto generated"}
          />
          <SelectField
            control={control}
            name="transportName"
            label="Transport Name"
            options={transporterData}
            required
            errors={formErrs}
          />
          <InputField
            control={control}
            type="date"
            name="docDate"
            label="Doc Date"
            errors={errors}
          />
          <InputField
            control={control}
            name="billNo"
            label="Bill No"
            required
            placeholder="Enter Bill No"
            errors={formErrs}
          />
          <InputField
            control={control}
            type="date"
            name="billDate"
            label="Bill Date"
            required
            errors={formErrs}
          />
          <InputField
            control={control}
            name="totalAmount"
            label="Total Amount"
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            errors={formErrs}
          />
          <InputField
            control={control}
            type="date"
            name="billReceivedDate"
            label="Bill Received Date"
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="accReceivedDate"
            label="Acc Received Date"
            errors={errors}
          />
          <SelectField
            control={control}
            name="receivedBy"
            label="Received By"
            options={receivedByData}
            errors={errors}
          />
          <SelectField
            control={control}
            name="accReceivedBy"
            label="Acc Received By"
            options={receivedByData}
            errors={errors}
          />
        </div>

        {/* Tabs Section */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Payment Details 1 */}
          {activeTab === "payment1" && (
            <div className="space-y-1">
              <div className="flex items-center justify-end mb-2">
                <button
                  type="button"
                  onClick={() => append1(getDefaultPaymentRow())}
                  className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs min-w-[600px]">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="p-1.5 text-center dark:text-white whitespace-nowrap text-[10px] font-medium sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                        S.No
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[130px]">
                        Cheque/RTGS No
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[110px]">
                        Cheque Date
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">
                        Total Amount
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">
                        Paid Amount
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[110px]">
                        Pending Amount
                      </th>
                      <th className="p-1.5 text-center dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[60px] sticky right-0 bg-gray-100 dark:bg-gray-700 z-10">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields1.map((field, index) => (
                      <tr
                        key={field.id}
                        className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-1 text-center font-medium dark:text-white text-[10px] sticky left-0 bg-white dark:bg-gray-800 z-10">
                          {index + 1}
                        </td>
                        <td className="p-0.5 align-top min-w-[130px]">
                          <InputCell
                            control={control}
                            name={`paymentDetails1.${index}.chequeRtgsNo`}
                            placeholder="Enter"
                            errors={errors}
                          />
                        </td>
                        <td className="p-0.5 align-top min-w-[110px]">
                          <InputCell
                            control={control}
                            name={`paymentDetails1.${index}.chequeDate`}
                            type="date"
                            errors={errors}
                          />
                        </td>
                        <td className="p-0.5 align-top min-w-[100px]">
                          <InputCell
                            control={control}
                            name={`paymentDetails1.${index}.totalAmount`}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            align="right"
                            errors={errors}
                            onChange={(e) => {
                              const val = e.target.value;
                              const row = watch1?.[index];
                              handlePaymentChange(
                                "paymentDetails1",
                                index,
                                "totalAmount",
                                val,
                                row,
                              );
                            }}
                          />
                        </td>
                        <td className="p-0.5 align-top min-w-[100px]">
                          <InputCell
                            control={control}
                            name={`paymentDetails1.${index}.paidAmount`}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            align="right"
                            errors={errors}
                            onChange={(e) => {
                              const val = e.target.value;
                              const row = watch1?.[index];
                              handlePaymentChange(
                                "paymentDetails1",
                                index,
                                "paidAmount",
                                val,
                                row,
                              );
                            }}
                          />
                        </td>
                        <td className="p-0.5 align-top min-w-[110px]">
                          <InputCell
                            control={control}
                            name={`paymentDetails1.${index}.pendingAmount`}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            align="right"
                            errors={errors}
                            readOnly
                          />
                        </td>
                        <td className="p-1 text-center sticky right-0 bg-white dark:bg-gray-800 z-10">
                          <button
                            type="button"
                            onClick={() => remove1(index)}
                            disabled={fields1.length <= 1}
                            className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                              fields1.length <= 1
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            <Trash2 size={10} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {fields1.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-4 text-center text-gray-500 dark:text-gray-400 text-xs"
                        >
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />{" "}
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransportBillForm;
