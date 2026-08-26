// PoShortCloseForm.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import poDelScheduleAPI from "../../../api/Purchase/poDeliverySchShortClose";

const controlClasses =
    "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
    "bg-white dark:bg-gray-900 " +
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
    "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

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
                    className={`${controlClasses} ${error ? "border-red-500" : ""}`}
                    disabled={disabled}
                >
                    <option value="">Select an option</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
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
                <label className={`${controlClasses} flex items-center gap-2 cursor-pointer h-[30px]`}>
                    <input
                        type="checkbox"
                        name={name}
                        checked={checked}
                        onChange={onChange}
                        className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-200 text-xs">{label}</span>
                </label>
            </div>
        );
    }

    if (type === "radio") {
        return (
            <div className={`w-full ${className}`}>
                <label className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
                <div className="flex items-center gap-4">
                    {options.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                            <input
                                type="radio"
                                name={name}
                                value={opt.value}
                                checked={value === opt.value}
                                onChange={onChange}
                                className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">{opt.label}</span>
                        </label>
                    ))}
                </div>
                {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
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
                className={`${controlClasses} ${error ? "border-red-500" : ""}`}
                placeholder={placeholder}
                disabled={disabled}
            />
            {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
        </div>
    );
};

const fieldGrid = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

const BELONGS_TO = ["APPLIANCES", "BOSCH"];

// Helper function to get financial year
const getFinancialYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    if (month >= 0 && month <= 2) {
        return `${year - 1}-${year}`;
    }
    return `${year}`;
};

// Main Component
const PoShortCloseForm = ({ data, onBack }) => {
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [branchId] = useState(localStorage.getItem("branchId"));
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState("orderClosedDetail");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Refs to prevent multiple API calls
    const branchesLoadedRef = useRef(false);
    const typeLoadedRef = useRef(false);
    const suppliersLoadedRef = useRef(false);
    const poLoadedRef = useRef(false);
    const docIdLoadedRef = useRef(false);
    const poDetailsLoadedRef = useRef(false);
    const isMounted = useRef(true);
    const dataLoadedRef = useRef(false);

    // Dropdown options
    const [plantOptions, setPlantOptions] = useState([]);
    const [belongsToOptions, setBelongsToOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [poOptions, setPoOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);

    const [form, setForm] = useState({
        plantId: data?.plantId || "",
        belongsTo: data?.belongsTo || "",
        type: data?.type || "",
        supplierCode: data?.supplierCode || "",
        poNo: data?.poNo || "",
        shortCloseNo: data?.shortCloseNo || "",
        shortCloseDate: data?.shortCloseDate || new Date().toISOString().split('T')[0],
        supplierName: data?.supplierName || "",
        orderStatus: data?.orderStatus || "",
        reference: data?.reference || "",
    });

    // Order Closed Detail Rows
    const [orderRows, setOrderRows] = useState([
        {
            id: 1,
            itemCode: "",
            itemDescription: "",
            unit: "",
            orderedQty: "",
            suppliedQty: "",
            pendingQty: "",
            shortCloseQty: "",
            newRequiredQty: "",
        },
    ]);

    const loadBranches = useCallback(async () => {
        if (branchesLoadedRef.current || !isMounted.current) return;

        try {
            const response = await branchAPI.getBranchByOrgId(orgId);
            const options = (response || []).map(branch => ({
                value: branch.id,
                label: branch.branchName || branch.branchCode || branch.id,
            }));
            setPlantOptions(options);
            branchesLoadedRef.current = true;
        } catch (error) {
            console.error("Failed to load branches:", error);
            setPlantOptions([]);
        }
    }, [orgId]);

    const loadType = useCallback(async () => {
        if (typeLoadedRef.current || !isMounted.current) return;

        try {
            const response = await listOfValuesAPI.getListValuesGroup("PO SHORTCLOSE TYPE", orgId);
            const options = (response || []).map(item => ({
                value: item.id,
                label: item.valuesDescription,
            }));
            setTypeOptions(options);
            typeLoadedRef.current = true;
        } catch (error) {
            console.error("Failed to load type options:", error);
            setTypeOptions([]);
        }
    }, [orgId]);

    const loadSuppliers = useCallback(async () => {
        if (suppliersLoadedRef.current || !orgId || !branchId || !isMounted.current) return;

        setLoading(true);
        try {
            const response = await poDelScheduleAPI.getSupplierDetailsShortClose(branchId, orgId);
            console.log("Supplier Response:", response);

            const supplierList = response?.paramObjectsMap?.mapp || [];
            const options = supplierList.map(supplier => ({
                value: supplier.supplierId,
                label: `${supplier.supplierCode} - ${supplier.supplierName}`,
                supplierName: supplier.supplierName,
                supplierCode: supplier.supplierCode,
            }));
            setSupplierOptions(options);
            suppliersLoadedRef.current = true;
        } catch (error) {
            console.error("Failed to load suppliers:", error);
            setSupplierOptions([]);
            addToast("Failed to load suppliers", "error");
        } finally {
            setLoading(false);
        }
    }, [orgId, branchId, addToast]);

    const loadPOOptions = useCallback(async () => {
        if (!form.supplierCode || !orgId || !branchId || !isMounted.current) {
            setPoOptions([]);
            return;
        }

        if (poLoadedRef.current) return;

        setLoading(true);
        try {
            const response = await poDelScheduleAPI.getPurchaseOrderNoBasedSchedule(
                branchId,
                orgId,
                form.supplierCode
            );
            console.log("PO Response:", response);

            const poList = response?.paramObjectsMap?.mapp || [];
            const options = poList.map(po => ({
                value: po.purchaseId,
                label: po.docId,
                docId: po.docId,
                docDate: po.docDate,
            }));
            setPoOptions(options);
            poLoadedRef.current = true;
        } catch (error) {
            console.error("Failed to load PO options:", error);
            setPoOptions([]);
            addToast("Failed to load Purchase Orders", "error");
        } finally {
            setLoading(false);
        }
    }, [form.supplierCode, orgId, branchId, addToast]);

    // Load PO Details (Items) based on selected PO
    const loadPODetails = useCallback(async () => {
        if (!form.poNo || !form.supplierCode || !orgId || !branchId || !isMounted.current) {
            return;
        }

        if (poDetailsLoadedRef.current) return;

        setLoading(true);
        try {
            // Find the selected PO to get the docId
            const selectedPO = poOptions.find(
                (opt) => String(opt.value) === String(form.poNo)
            );

            // Use the docId (docId or label) for the API call, not the purchaseId (value)
            const purchaseOrderNo = selectedPO?.docId || selectedPO?.label || form.poNo;

            console.log("Fetching details for PO DocId:", purchaseOrderNo);

            const response = await poDelScheduleAPI.getPurchaseOrderNoBasedScheduleDetails(
                branchId,
                orgId,
                purchaseOrderNo,
                form.supplierCode
            );
            console.log("PO Details Response:", response);

            const itemList = response?.paramObjectsMap?.mapp || [];

            if (itemList.length > 0 && isMounted.current) {
                // Create item options from the response
                const options = itemList.map(item => ({
                    value: item.itemId,
                    label: `${item.itemCode} - ${item.itemDescription || ''}`,
                    itemCode: item.itemCode,
                    itemDescription: item.itemDescription,
                    unit: item.unitDescription || item.uom || "",
                    orderQty: item.orderQty,
                    suppliedQty: item.suppliedQty,
                    pendingQty: item.pendingQty,
                }));
                setItemOptions(options);

                // Populate the order rows with the items
                const newOrderRows = itemList.map((item, index) => ({
                    id: Date.now() + index,
                    itemCode: item.itemId,
                    itemDescription: item.itemDescription || "",
                    unit: item.unitDescription || item.uom || "",
                    orderedQty: item.orderQty || "",
                    suppliedQty: item.suppliedQty || "",
                    pendingQty: item.pendingQty || "",
                    shortCloseQty: "",
                    newRequiredQty: "",
                }));

                setOrderRows(newOrderRows);
                poDetailsLoadedRef.current = true;
            } else if (isMounted.current) {
                setItemOptions([]);
                // Reset to default row if no items
                setOrderRows([
                    {
                        id: Date.now(),
                        itemCode: "",
                        itemDescription: "",
                        unit: "",
                        orderedQty: "",
                        suppliedQty: "",
                        pendingQty: "",
                        shortCloseQty: "",
                        newRequiredQty: "",
                    },
                ]);
            }
        } catch (error) {
            console.error("Failed to load PO details:", error);
            setItemOptions([]);
            addToast("Failed to load Items", "error");
        } finally {
            setLoading(false);
        }
    }, [form.poNo, form.supplierCode, orgId, branchId, poOptions, addToast]);

    // Load Doc ID for new form
    const loadDocId = useCallback(async () => {
        if (docIdLoadedRef.current || data?.id || !isMounted.current) return;

        setLoading(true);
        try {
            const financialYear = getFinancialYear();
            const response = await poDelScheduleAPI.getPurchaseOrderDeliveryScheduleShortCloseDocId(
                financialYear,
                orgId
            );

            console.log("Doc ID Response:", response);

            if (response?.status && response?.paramObjectsMap?.invoiceDocId && isMounted.current) {
                const docId = response.paramObjectsMap.invoiceDocId;
                setForm(prev => ({
                    ...prev,
                    shortCloseNo: docId,
                }));
                docIdLoadedRef.current = true;
            } else if (isMounted.current) {
                setForm(prev => ({
                    ...prev,
                    shortCloseNo: "Auto-generated",
                }));
            }
        } catch (error) {
            console.error("Failed to load Doc ID:", error);
            if (isMounted.current) {
                setForm(prev => ({
                    ...prev,
                    shortCloseNo: "Auto-generated",
                }));
                addToast("Failed to generate document number", "warning");
            }
        } finally {
            setLoading(false);
        }
    }, [orgId, data?.id, addToast]);

    // Load edit data when editing
    const loadEditData = useCallback(async () => {
        if (!data?.id || dataLoadedRef.current) return;

        setLoading(true);
        try {
            const response = await poDelScheduleAPI.getPurchaseOrderDeliveryScheduleShortCloseById(data.id);

            console.log("Get By ID Response:", response);

            const recordData = response?.paramObjectsMap?.purchaseOrderDeliveryScheduleShortCloseVO;

            if (!recordData) {
                console.error("Purchase Order Delivery Schedule Short Close data not found");
                return;
            }

            console.log("Record Data:", recordData);

            // Map the data to form fields
            const formData = {
                plantId: recordData.branch?.id?.toString() || "",
                belongsTo: recordData.belongsTo || "",
                type: recordData.type || "",
                supplierCode: recordData.supplierCode?.id?.toString() || "",
                supplierName: recordData.supplierCode?.supplierName || "",
                poNo: recordData.purchaseOrderScheduleNo || "",
                shortCloseNo: recordData.docId || "",
                shortCloseDate: recordData.docDate || new Date().toISOString().split('T')[0],
                reference: recordData.referenceForShortClose || recordData.narration || "",
                orderStatus: recordData.active === "Active" ? "Approved" : "Pending",
            };

            console.log("Populated Form Data:", formData);

            // Set form values
            setForm(formData);

            // Populate order rows with details
            const details = recordData.purchaseOrderDeliveryScheduleShortCloseDetailsResponseDTO || [];
            if (details.length > 0) {
                const newOrderRows = details.map((detail, index) => ({
                    id: Date.now() + index,
                    itemCode: detail.item?.id?.toString() || "",
                    itemDescription: detail.item?.itemDescription || "",
                    unit: detail.item?.unit?.unitId || detail.item?.unit?.id?.toString() || "",
                    orderedQty: detail.orderedQty?.toString() || "",
                    suppliedQty: detail.suppliedQty?.toString() || "",
                    pendingQty: detail.pendingQty?.toString() || "",
                    shortCloseQty: detail.shortCloseQty?.toString() || "",
                    newRequiredQty: detail.newRequiredQty?.toString() || "",
                }));
                setOrderRows(newOrderRows);

                // Create item options from details
                const options = details.map(detail => ({
                    value: detail.item?.id?.toString() || "",
                    label: `${detail.item?.itemCode || ''} - ${detail.item?.itemDescription || ''}`,
                    itemCode: detail.item?.itemCode || "",
                    itemDescription: detail.item?.itemDescription || "",
                    unit: detail.item?.unit?.unitId || "",
                    orderQty: detail.orderedQty || 0,
                    suppliedQty: detail.suppliedQty || 0,
                    pendingQty: detail.pendingQty || 0,
                }));
                setItemOptions(options);
            }

            // Set the PO loaded ref to true to prevent reloading
            poLoadedRef.current = true;
            poDetailsLoadedRef.current = true;
            dataLoadedRef.current = true;

        } catch (error) {
            console.error("Failed to load edit data:", error);
            addToast("Failed to load Purchase Order Delivery Schedule Short Close data", "error");
        } finally {
            setLoading(false);
        }
    }, [data?.id, addToast]);

    // Auto-fill supplier name when supplier is selected
    useEffect(() => {
        if (form.supplierCode && supplierOptions.length > 0) {
            const selectedSupplier = supplierOptions.find(
                (opt) => String(opt.value) === String(form.supplierCode)
            );
            if (selectedSupplier) {
                setForm(prev => ({
                    ...prev,
                    supplierName: selectedSupplier.supplierName || "",
                }));
            }
        } else if (!form.supplierCode) {
            setForm(prev => ({
                ...prev,
                supplierName: "",
            }));
        }
    }, [form.supplierCode, supplierOptions]);

    // Load PO options when supplier changes
    useEffect(() => {
        if (form.supplierCode && !data?.id) {
            poLoadedRef.current = false; // Reset ref when supplier changes
            loadPOOptions();
        } else if (!form.supplierCode) {
            setPoOptions([]);
        }
        // Reset PO details when supplier changes
        if (!data?.id) {
            poDetailsLoadedRef.current = false;
        }
    }, [form.supplierCode, loadPOOptions, data?.id]);

    // Load PO Details when PO changes
    useEffect(() => {
        if (form.poNo && form.supplierCode && !data?.id) {
            poDetailsLoadedRef.current = false; // Reset ref when PO changes
            loadPODetails();
        }
    }, [form.poNo, form.supplierCode, loadPODetails, data?.id]);

    // Load Doc ID for new form (only if no data is passed)
    useEffect(() => {
        if (orgId && !data?.id && !docIdLoadedRef.current) {
            loadDocId();
        }
    }, [orgId, data?.id, loadDocId]);

    // Load edit data when data prop is provided
    useEffect(() => {
        if (data?.id && !dataLoadedRef.current) {
            loadEditData();
        }
    }, [data?.id, loadEditData]);

    // Load all dropdowns on mount
    useEffect(() => {
        isMounted.current = true;
        loadBranches();
        loadType();
        loadSuppliers();

        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }

        // Reset PO details when PO changes
        if (name === "poNo") {
            poDetailsLoadedRef.current = false;
        }

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleOrderRowChange = (index, field, value) => {
        const updatedRows = [...orderRows];
        updatedRows[index][field] = value;

        // Auto-calculate pending qty = ordered - supplied
        if (field === "orderedQty" || field === "suppliedQty") {
            const ordered = parseFloat(updatedRows[index].orderedQty) || 0;
            const supplied = parseFloat(updatedRows[index].suppliedQty) || 0;
            updatedRows[index].pendingQty = (ordered - supplied).toFixed(3);
        }

        // Calculate New Required Qty = Supplied Qty - Pending Qty - Short Close Qty
        if (field === "shortCloseQty" || field === "suppliedQty" || field === "pendingQty") {
            const supplied = parseFloat(updatedRows[index].suppliedQty) || 0;
            const pending = parseFloat(updatedRows[index].pendingQty) || 0;
            const shortClose = parseFloat(updatedRows[index].shortCloseQty) || 0;
            const newRequired = supplied - pending - shortClose;
            updatedRows[index].newRequiredQty = newRequired.toFixed(3);
        }

        setOrderRows(updatedRows);
    };

    const handleAddOrderRow = () => {
        setOrderRows([
            ...orderRows,
            {
                id: Date.now(),
                itemCode: "",
                itemDescription: "",
                unit: "",
                orderedQty: "",
                suppliedQty: "",
                pendingQty: "",
                shortCloseQty: "",
                newRequiredQty: "",
            },
        ]);
    };

    const handleRemoveOrderRow = (index) => {
        if (orderRows.length > 1) {
            setOrderRows(orderRows.filter((_, i) => i !== index));
        }
    };

    const validate = () => {
        const errors = {};
        if (!form.plantId) errors.plantId = "Plant ID is required";
        if (!form.type) errors.type = "Type is required";
        if (!form.supplierCode) errors.supplierCode = "Supplier Code is required";
        if (!form.poNo) errors.poNo = "PO/ Del.Sch.No is required";
        if (!form.shortCloseDate) errors.shortCloseDate = "Short Close Date is required";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            const isUpdate = Boolean(data?.id);

            // Get the selected PO docId
            const selectedPO = poOptions.find(
                (opt) => String(opt.value) === String(form.poNo)
            );
            const purchaseOrderScheduleNo = selectedPO?.docId || form.poNo;

            // Get supplier code from selected supplier
            const selectedSupplier = supplierOptions.find(
                (opt) => String(opt.value) === String(form.supplierCode)
            );
            const supplierCode = selectedSupplier?.supplierCode || form.supplierCode;

            const payload = {
                ...(isUpdate ? { id: data.id } : {}),
                active: true,
                belongsTo: form.belongsTo || "",
                branch: Number(branchId),
                cancel: false,
                cancelRemarks: "",
                createdBy: localStorage.getItem("usersId") || "",
                financialYear: getFinancialYear(),
                narration: form.reference || "",
                orgId: Number(orgId),
                purchaseOrderDeliveryScheduleShortCloseDetailsDTO: orderRows.map(row => ({
                    item: Number(row.itemCode) || 0,
                    orderedQty: Number(row.orderedQty) || 0,
                    pendingQty: Number(row.pendingQty) || 0,
                    shortCloseQty: Number(row.shortCloseQty) || 0,
                    suppliedQty: Number(row.suppliedQty) || 0,
                    unit: Number(row.unit) || 0,
                })),
                purchaseOrderScheduleNo: purchaseOrderScheduleNo,
                referenceForShortClose: form.reference || "",
                supplierCode: Number(form.supplierCode) || 0,
                type: form.type || "",
            };

            console.log("Submit Payload:", payload);

            const response = await poDelScheduleAPI.createUpdateShortClose(payload);

            if (response?.status) {
                addToast(
                    response?.paramObjectsMap?.message ||
                    (isUpdate
                        ? "PO Short Close updated successfully!"
                        : "PO Short Close created successfully!"),
                    "success"
                );
                onBack();
            } else {
                addToast(
                    response?.errors?.[0]?.shortMessage ||
                    response?.message ||
                    "Failed to save PO Short Close.",
                    "error"
                );
            }
        } catch (err) {
            console.error("Save PO Short Close Error:", err);
            if (err.response?.data) {
                addToast(
                    err.response.data.message ||
                    err.response.data.statusMessage ||
                    JSON.stringify(err.response.data),
                    "error"
                );
            } else {
                addToast("Something went wrong.", "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get available items for dropdown (excluding already selected ones)
    const getAvailableItems = (currentIndex) => {
        const selectedItems = orderRows
            .filter((_, index) => index !== currentIndex)
            .map((row) => row.itemCode);
        return itemOptions.filter((item) => !selectedItems.includes(item.value));
    };

    if (loading && data?.id) {
        return (
            <div className="p-2 max-w-7xl">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500 dark:text-gray-400">Loading...</div>
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
                    className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {data?.id ? "Edit PO/Delv.Sch. Shortclose" : "Add PO/Delv.Sch. Shortclose"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields */}
                <div className={fieldGrid}>
                    <Field
                        type="select"
                        label="Plant ID"
                        name="plantId"
                        value={form.plantId}
                        onChange={handleChange}
                        error={fieldErrors.plantId}
                        required
                        options={plantOptions}
                    />
                    <Field
                        label="Short Close No."
                        name="shortCloseNo"
                        value={form.shortCloseNo}
                        onChange={handleChange}
                        placeholder={loading ? "Generating..." : "Auto"}
                        disabled={true}
                    />

                    <Field
                        label="Short Close Date"
                        name="shortCloseDate"
                        type="date"
                        value={form.shortCloseDate}
                        onChange={handleChange}
                        required
                        error={fieldErrors.shortCloseDate}
                    />

                    <Field
                        type="select"
                        label="Belongs To"
                        name="belongsTo"
                        value={form.belongsTo}
                        onChange={handleChange}
                        options={belongsToOptions.length > 0 ? belongsToOptions : BELONGS_TO.map(item => ({ value: item, label: item }))}
                    />

                    <Field
                        type="select"
                        label="Type"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        error={fieldErrors.type}
                        required
                        options={typeOptions}
                    />

                    <Field
                        type="select"
                        label="Supplier Code"
                        name="supplierCode"
                        value={form.supplierCode}
                        onChange={handleChange}
                        error={fieldErrors.supplierCode}
                        required
                        options={supplierOptions}
                        disabled={loading}
                    />

                    <Field
                        label="Supplier Name"
                        name="supplierName"
                        value={form.supplierName}
                        onChange={handleChange}
                        disabled={true}
                    />

                    <Field
                        type="select"
                        label="PO/Del.Sch.No"
                        name="poNo"
                        value={form.poNo}
                        onChange={handleChange}
                        error={fieldErrors.poNo}
                        required
                        options={poOptions}
                        disabled={loading || !form.supplierCode}
                        placeholder={loading ? "Loading PO numbers..." : poOptions.length === 0 && form.supplierCode ? "No PO available" : "Select an option"}
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab("orderClosedDetail")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "orderClosedDetail"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Order Closed Detail
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("summary")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "summary"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Summary
                    </button>
                </div>

                {/* Order Closed Detail Tab */}
                {activeTab === "orderClosedDetail" && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Order Closed Detail
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddOrderRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-xs min-w-[800px]">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">S.no</th>
                                        <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Item Code *</th>
                                        <th className="p-1 text-left min-w-[150px] dark:text-gray-200">Item Description</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">Unit</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Ordered Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Supplied Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Pending Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Short Close Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">New Required Qty</th>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderRows.map((row, index) => (
                                        <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-1 text-center font-medium dark:text-gray-300">
                                                {index + 1}
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.itemCode}
                                                    onChange={(e) => handleOrderRowChange(index, "itemCode", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                                                >
                                                    <option value="">Select an option</option>
                                                    {getAvailableItems(index).map((item) => (
                                                        <option key={item.value} value={item.value}>
                                                            {item.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="text"
                                                    value={row.itemDescription}
                                                    onChange={(e) => handleOrderRowChange(index, "itemDescription", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[140px]`}
                                                    placeholder="Description"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="text"
                                                    value={row.unit}
                                                    onChange={(e) => handleOrderRowChange(index, "unit", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[80px]`}
                                                    placeholder="Unit"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.orderedQty}
                                                    onChange={(e) => handleOrderRowChange(index, "orderedQty", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                    disabled={true}
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.suppliedQty}
                                                    onChange={(e) => handleOrderRowChange(index, "suppliedQty", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                    disabled={true}
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.pendingQty}
                                                    onChange={(e) => handleOrderRowChange(index, "pendingQty", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                    disabled={true}
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.shortCloseQty}
                                                    onChange={(e) => handleOrderRowChange(index, "shortCloseQty", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.newRequiredQty}
                                                    onChange={(e) => handleOrderRowChange(index, "newRequiredQty", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                    disabled={true}
                                                />
                                            </td>
                                            <td className="p-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveOrderRow(index)}
                                                    disabled={orderRows.length <= 1}
                                                    className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${orderRows.length <= 1
                                                        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                                                        : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
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
                    </div>
                )}

                {/* Summary Tab */}
                {activeTab === "summary" && (
                    <div className="mt-2 space-y-4">
                        {/* Reference for Short Close */}
                        <div className={fieldGrid}>
                            <Field
                                label="Reference for Short Close"
                                name="reference"
                                value={form.reference}
                                onChange={handleChange}
                                placeholder="Enter Reference"
                                className="col-span-2"
                            />
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <X className="h-3 w-3" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="h-3 w-3" />
                        {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PoShortCloseForm;