import { ArrowLeft, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import partyAccountMappingAPI from "../../../api/partyAccountMappingAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const CATEGORY_OPTIONS = ["CUSTOMER", "SUPPLIER", "AGENT", "OTHER"];

let rowIdCounter = 1;
const newRow = () => ({
  rowId: `row-${rowIdCounter++}`,
  partyId: "",
  partyName: "",
  accountId: "",
  accountName: "",
});

const PartyAccountMappingForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const [parties, setParties] = useState([]);
  const [partiesLoading, setPartiesLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});

  const [form, setForm] = useState({
    id: editData?.id || 0,
    docId: editData?.docId || "",
    docDate: editData?.docDate || new Date().toISOString().slice(0, 10),
    asOnDate: editData?.asOnDate || new Date().toISOString().slice(0, 10),
    category: editData?.category || "CUSTOMER",
    active: editData?.active ?? true,
    orgId: ORG_ID,
    createdBy: localStorage.getItem("userName") || "SYSTEM",
  });

  const [rows, setRows] = useState(
    editData?.mappingDetails?.length
      ? editData.mappingDetails.map((d) => ({
          rowId: `row-${rowIdCounter++}`,
          ...d,
        }))
      : [newRow()],
  );

  // Reload the party list whenever the category changes, since party options
  // are category-specific (CUSTOMER vs SUPPLIER etc.)
  useEffect(() => {
    fetchParties(form.category);
  }, [form.category]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchParties = async (category) => {
    try {
      setPartiesLoading(true);
      const response = await partyAccountMappingAPI.getParties(
        ORG_ID,
        category,
      );
      setParties(response || []);
    } catch (error) {
      console.error("Error fetching parties:", error);
      addToast("Failed to load parties", "error");
    } finally {
      setPartiesLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      setAccountsLoading(true);
      const response = await partyAccountMappingAPI.getAccounts(ORG_ID);
      setAccounts(response || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      addToast("Failed to load accounts", "error");
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Party Id and Party Name are kept in sync - selecting either one fills
  // the other from the same party master record.
  const handlePartyIdChange = (rowId, partyId) => {
    const selected = parties.find((p) => p.partyId === partyId);
    updateRow(rowId, {
      partyId,
      partyName: selected?.partyName || "",
    });
  };

  const handlePartyNameChange = (rowId, partyName) => {
    const selected = parties.find((p) => p.partyName === partyName);
    updateRow(rowId, {
      partyName,
      partyId: selected?.partyId || "",
    });
  };

  const handleAccountChange = (rowId, accountName) => {
    const selected = accounts.find((a) => a.accountName === accountName);
    updateRow(rowId, {
      accountName,
      accountId: selected?.accountId || "",
    });
  };

  const updateRow = (rowId, changes) => {
    setRows((prev) =>
      prev.map((row) => (row.rowId === rowId ? { ...row, ...changes } : row)),
    );
    setRowErrors((prev) => ({ ...prev, [rowId]: {} }));
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, newRow()]);
  };

  const handleRemoveRow = (rowId) => {
    if (rows.length === 1) {
      addToast("At least one mapping row is required", "error");
      return;
    }
    setRows((prev) => prev.filter((row) => row.rowId !== rowId));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const validate = () => {
    const errors = {};
    if (!form.docDate) errors.docDate = "Doc Date is required";
    if (!form.asOnDate) errors.asOnDate = "As On Date is required";
    if (!form.category) errors.category = "Category is required";

    const newRowErrors = {};
    let hasRowError = false;

    rows.forEach((row) => {
      const rErr = {};
      if (!row.partyId) rErr.partyId = "Party Id is required";
      if (!row.partyName) rErr.partyName = "Party Name is required";
      if (!row.accountName) rErr.accountName = "Account Name is required";

      if (Object.keys(rErr).length > 0) {
        hasRowError = true;
        newRowErrors[row.rowId] = rErr;
      }
    });

    setFieldErrors(errors);
    setRowErrors(newRowErrors);

    if (Object.keys(errors).length > 0) return Object.values(errors)[0];
    if (hasRowError) return "Please complete all mapping rows";
    return null;
  };

  const handleSave = async () => {
    const errorMessage = validate();
    if (errorMessage) {
      addToast(errorMessage, "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      docDate: form.docDate,
      asOnDate: form.asOnDate,
      category: form.category,
      active: Boolean(form.active),
      createdBy: form.createdBy,
      orgId: form.orgId,
      mappingDetails: rows.map(
        ({ partyId, partyName, accountId, accountName }) => ({
          partyId,
          partyName,
          accountId,
          accountName,
        }),
      ),
    };

    if (form.id && form.id > 0) {
      payload.id = form.id;
    }

    console.log("📤 Saving Party Account Mapping Payload:", payload);

    try {
      const response =
        await partyAccountMappingAPI.updateCreateMapping(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (form.id && form.id > 0
            ? "Mapping updated successfully!"
            : "Mapping created successfully!");

        addToast(successMessage, "success");

        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save mapping";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";

      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 max-w-7xl ">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {editData
            ? "Edit Mapping Of Party To Account"
            : "Mapping Of Party To Account"}
        </h2>
      </div>

      {/* HEADER FIELDS CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Doc Id - auto generated, read-only */}
          <div>
            <label className={labelClasses}>Doc Id</label>

            <input
              value={form.docId || "Auto"}
              disabled
              className={`${controlClasses} bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed`}
            />
          </div>

          {/* Doc Date */}
          <div>
            <label className={labelClasses}>
              Doc Date <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              name="docDate"
              value={form.docDate}
              onChange={handleHeaderChange}
              className={`${controlClasses} ${
                fieldErrors.docDate ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.docDate && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.docDate}
              </p>
            )}
          </div>

          {/* As On Date */}
          <div>
            <label className={labelClasses}>
              As On Date <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              name="asOnDate"
              value={form.asOnDate}
              onChange={handleHeaderChange}
              className={`${controlClasses} ${
                fieldErrors.asOnDate ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.asOnDate && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.asOnDate}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className={labelClasses}>
              Category <span className="text-red-500">*</span>
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleHeaderChange}
              className={`${controlClasses} ${
                fieldErrors.category ? "border-red-500" : ""
              }`}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {fieldErrors.category && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.category}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MAPPING DETAIL CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Mapping Detail
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 w-14">
                  S.No
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Party Id
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Party Name
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Account Name
                </th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((row, index) => (
                <tr key={row.rowId}>
                  <td className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </td>

                  {/* Party Id */}
                  <td className="px-3 py-1.5">
                    <select
                      value={row.partyId}
                      onChange={(e) =>
                        handlePartyIdChange(row.rowId, e.target.value)
                      }
                      disabled={partiesLoading}
                      className={`${controlClasses} ${
                        rowErrors[row.rowId]?.partyId ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Party Id</option>
                      {parties.map((party) => (
                        <option key={party.partyId} value={party.partyId}>
                          {party.partyId}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Party Name */}
                  <td className="px-3 py-1.5">
                    <select
                      value={row.partyName}
                      onChange={(e) =>
                        handlePartyNameChange(row.rowId, e.target.value)
                      }
                      disabled={partiesLoading}
                      className={`${controlClasses} ${
                        rowErrors[row.rowId]?.partyName ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Party Name</option>
                      {parties.map((party) => (
                        <option key={party.partyId} value={party.partyName}>
                          {party.partyName}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Account Name */}
                  <td className="px-3 py-1.5">
                    <select
                      value={row.accountName}
                      onChange={(e) =>
                        handleAccountChange(row.rowId, e.target.value)
                      }
                      disabled={accountsLoading}
                      className={`${controlClasses} ${
                        rowErrors[row.rowId]?.accountName
                          ? "border-red-500"
                          : ""
                      }`}
                    >
                      <option value="">Select Account</option>
                      {accounts.map((account) => (
                        <option
                          key={account.accountId}
                          value={account.accountName}
                        >
                          {account.accountName}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.rowId)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove Row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add Row
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-2 pt-3 mt-3">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
        >
          <Save className="h-3 w-3" />
          {isSubmitting ? "Saving..." : editData ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default PartyAccountMappingForm;
