import { ArrowLeft, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import partyAccountMappingAPI from "../../../api/partyAccountMappingAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const CATEGORY_LIST_CODE = "MAPPING OF PARTY TO ACCOUNT";
const FALLBACK_CATEGORIES = ["CAPITAL GOODS", "CUSTOMER", "SUPPLIER", "TRANSPORTER"];

const normalizeListValue = (v) => ({
  id: v.id,
  label: v.valuesDescription || v.valueDescription || v.valueCode || v.id,
});

let rowIdCounter = 1;
const newRow = () => ({
  rowId: `row-${rowIdCounter++}`,
  partyId: "",
  partyName: "",
  accountName: "",
});

const normalizeDetail = (d) => ({
  rowId: `row-${rowIdCounter++}`,
  partyId: d?.party?.id != null ? String(d.party.id) : d?.partyId != null ? String(d.partyId) : "",
  partyName: d?.party?.partyName || d?.partyName || "",
  accountName: d?.accountName || "",
});

const toNumber = (val) => (val ? Number(val) || val : "");

const PartyAccountMappingForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const BRANCH = Number(localStorage.getItem("branchId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [categoryGroupId, setCategoryGroupId] = useState(null);
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
    branch: editData?.branch?.id || BRANCH,
    category: editData?.category?.id || "",
    active: editData?.active === true || editData?.active === "Active",
    cancelRemarks: "",
    orgId: ORG_ID,
    createdBy: localStorage.getItem("userName") || "SYSTEM",
  });

  const [rows, setRows] = useState(
    editData?.details?.length
      ? editData.details.map(normalizeDetail)
      : [newRow()],
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [values, groups] = await Promise.all([
          listOfValuesAPI.getListValuesGroup(CATEGORY_LIST_CODE, ORG_ID),
          listOfValuesAPI.getListOfValuesByOrgId(BRANCH, ORG_ID),
        ]);
        setCategories((values || []).map(normalizeListValue));
        const group = (groups || []).find(
          (g) =>
            (g.listDescription || g.listCode || "").toUpperCase() ===
            CATEGORY_LIST_CODE,
        );
        setCategoryGroupId(group?.id || null);
      } catch (error) {
        console.warn(
          `Failed to load categories (list code: ${CATEGORY_LIST_CODE})`,
          error,
        );
        setCategories(FALLBACK_CATEGORIES.map((c) => ({ id: c, label: c })));
      }
    };
    if (ORG_ID) loadCategories();
  }, [ORG_ID, BRANCH]);

  // Reload the party list whenever the category changes, since party options
  // are category-specific. The backend stores parties under the LOV *group*
  // id, so getParty must be called with the group id rather than the
  // value-level id the dropdown exposes.
  useEffect(() => {
    if (!form.category || !categoryGroupId) {
      setParties([]);
      return;
    }
    const fetchParties = async () => {
      try {
        setPartiesLoading(true);
        const response = await partyAccountMappingAPI.getParties(
          ORG_ID,
          categoryGroupId,
          BRANCH,
        );
        setParties(response || []);
      } catch (error) {
        console.error("Error fetching parties:", error);
        setParties([]);
      } finally {
        setPartiesLoading(false);
      }
    };
    fetchParties();
  }, [form.category, categoryGroupId, ORG_ID, BRANCH]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setAccountsLoading(true);
        const response = await partyAccountMappingAPI.getAccounts(ORG_ID);
        setAccounts(response || []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setAccounts([]);
      } finally {
        setAccountsLoading(false);
      }
    };
    fetchAccounts();
  }, [ORG_ID]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePartyChange = (rowId, partyId) => {
    const selected = parties.find(
      (p) => String(p.partyId ?? p.id) === String(partyId),
    );
    updateRow(rowId, {
      partyId,
      partyName: selected?.partyName || selected?.name || "",
    });
  };

  const handleAccountChange = (rowId, accountName) => {
    updateRow(rowId, { accountName });
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
    if (rows.length <= 1) return;
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
      if (!row.partyId) rErr.partyId = "Party is required";
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
      active: Boolean(form.active),
      asOnDate: form.asOnDate,
      branch: toNumber(form.branch),
      cancelRemarks: form.active ? "" : form.cancelRemarks,
      category: toNumber(categoryGroupId) || toNumber(form.category),
      createdBy: form.createdBy,
      details: rows.map(({ partyId, accountName }) => ({
        partyId: toNumber(partyId),
        accountName,
      })),
      docDate: form.docDate,
      docId: form.docId ? toNumber(form.docId) : null,
      orgId: form.orgId,
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
    <div className="p-2 max-w-7xl">
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
            : "Add Mapping Of Party To Account"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {/* HEADER FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
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

          {/* Branch - read-only, always the current branch */}
          <div>
            <label className={labelClasses}>
              Branch <span className="text-red-500">*</span>
            </label>
            <input
              value={editData?.branch?.branchName || editData?.branch?.id || BRANCH}
              disabled
              className={`${controlClasses} bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed`}
            />
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
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.category}
              </p>
            )}
          </div>

          {/* Active */}
          <div>
            <label className={labelClasses}>Active</label>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  active: !prev.active,
                  cancelRemarks: "",
                }))
              }
              className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
                form.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
                  form.active ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Cancel Remarks - only relevant when marking inactive */}
          {!form.active && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelClasses}>Cancel Remarks</label>
              <input
                name="cancelRemarks"
                value={form.cancelRemarks}
                onChange={handleHeaderChange}
                placeholder="Reason for cancellation"
                className={controlClasses}
              />
            </div>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Mapping Detail
            </h3>
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-blue-600 border border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus className="h-3 w-3" /> Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-center w-8">
                    #
                  </th>
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-left">
                    Party
                  </th>
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-left">
                    Party Name
                  </th>
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-left">
                    Account Name
                  </th>
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-center w-10"></th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.rowId}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                      {index + 1}
                    </td>

                    {/* Party */}
                    <td className="px-2 py-1">
                      <select
                        value={row.partyId}
                        onChange={(e) =>
                          handlePartyChange(row.rowId, e.target.value)
                        }
                        disabled={partiesLoading}
                        className={`${controlClasses} ${
                          rowErrors[row.rowId]?.partyId ? "border-red-500" : ""
                        }`}
                      >
                        <option value="">Select Party</option>
                        {parties.map((party) => {
                          const partyId = party.partyId ?? party.id;
                          const partyLabel =
                            party.partyName || party.name || partyId;
                          return (
                            <option key={partyId} value={partyId}>
                              {partyLabel}
                            </option>
                          );
                        })}
                      </select>
                    </td>

                    {/* Party Name */}
                    <td className="px-2 py-1">
                      <input
                        value={row.partyName}
                        disabled
                        className={`${controlClasses} bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed`}
                      />
                    </td>

                    {/* Account Name */}
                    <td className="px-2 py-1">
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
                        {accounts.map((account) => {
                          const accountLabel =
                            account.accountName || account.name || account.accountId;
                          return (
                            <option key={account.accountId ?? accountLabel} value={accountLabel}>
                              {accountLabel}
                            </option>
                          );
                        })}
                      </select>
                    </td>

                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.rowId)}
                        disabled={rows.length <= 1}
                        className="p-0.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove Row"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
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
    </div>
  );
};

export default PartyAccountMappingForm;
