import {
  RefreshCw,
  Save,
  X,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import branchAPI from "../../../api/branchAPI";
import financialYearAPI from "../../../api/financialYearAPI";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";
import { toast } from "../../../utils/toast";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const SAVED_PAGE_SIZE = 8;

// onBack -> close / cancel
const DocTypeMappingPendingList = ({ onBack }) => {
  const ORG_ID = Number(localStorage.getItem("orgId"));

  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedBranchCode, setSelectedBranchCode] = useState("");

  const [finYears, setFinYears] = useState([]);
  const [finYearLoading, setFinYearLoading] = useState(false);
  const [selectedFinYear, setSelectedFinYear] = useState("");
  const [selectedFinYearId, setSelectedFinYearId] = useState("");
  const [selectedFinYearRecordId, setSelectedFinYearRecordId] = useState(0);

  // ---- Pending mapping (Mapping Details tab) ----
  const [pendingData, setPendingData] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---- Saved mapping (Saved Mappings tab) ----
  const [savedRecords, setSavedRecords] = useState([]);
  const [savedListLoading, setSavedListLoading] = useState(false);
  const [savedSearchTerm, setSavedSearchTerm] = useState("");
  const [savedPage, setSavedPage] = useState(1);
  // savedDetailInfo: the currently opened record's header info (null while browsing the list)
  const [savedDetailInfo, setSavedDetailInfo] = useState(null);
  const [savedDetailRows, setSavedDetailRows] = useState([]);

  // "pending" | "saved" - which tab is shown
  const [activeTab, setActiveTab] = useState("pending");
  // true while the tab should be picked automatically based on data;
  // becomes false the moment the user clicks a tab themselves, and is
  // reset to true whenever the branch/fin year filter changes.
  const autoTabRef = useRef(true);

  // Ensures the localStorage-based default branch/finYear is only applied once,
  // so it never overwrites a selection the user has since made.
  const defaultsAppliedRef = useRef(false);

  useEffect(() => {
    fetchBranches();
    fetchFinYears();
  }, []);

  // Default Branch / Fin Year from localStorage once both lookups have
  // loaded. Runs only once - the user can freely change either dropdown
  // afterward without it being reset.
  useEffect(() => {
    if (defaultsAppliedRef.current) return;
    if (branches.length === 0 || finYears.length === 0) return;

    const storedBranchId = localStorage.getItem("branchId");
    const storedFinYear = localStorage.getItem("finYear");

    if (storedBranchId) {
      const b = branches.find((br) => String(br.id) === String(storedBranchId));
      if (b) {
        setSelectedBranchId(String(b.id));
        setSelectedBranchCode(b.branchCode || "");
      }
    }

    if (storedFinYear) {
      const f = finYears.find(
        (fy) =>
          String(fy.finYear) === String(storedFinYear) ||
          String(fy.finYearId) === String(storedFinYear),
      );
      if (f) {
        setSelectedFinYear(f.finYear ?? storedFinYear);
        setSelectedFinYearId(f.finYearId || "");
        setSelectedFinYearRecordId(f.id || 0);
      }
    }

    defaultsAppliedRef.current = true;
  }, [branches, finYears]);

  const filtersReady =
    selectedBranchId &&
    selectedBranchCode &&
    selectedFinYear &&
    selectedFinYearId;

  // Pending mapping loads whenever the filters are ready/change.
  useEffect(() => {
    if (filtersReady) {
      loadPendingMappings();
    } else {
      setPendingData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedBranchId,
    selectedBranchCode,
    selectedFinYear,
    selectedFinYearId,
  ]);

  // Saved mapping list loads on mount and whenever the branch changes
  // (independent of pending, so both tabs are always ready to view).
  useEffect(() => {
    fetchSavedMappings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  const fetchBranches = async () => {
    try {
      setBranchLoading(true);
      const res = await branchAPI.getBranchByOrgId(ORG_ID);
      setBranches(res || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load branches");
    } finally {
      setBranchLoading(false);
    }
  };

  const fetchFinYears = async () => {
    try {
      setFinYearLoading(true);
      const res = await financialYearAPI.getAllFinancialYearByOrgId(ORG_ID);
      setFinYears(res || []);
    } catch (error) {
      console.error("Error fetching financial years:", error);
      toast.error("Failed to load financial years");
    } finally {
      setFinYearLoading(false);
    }
  };

  const handleBranchChange = (e) => {
    const id = e.target.value;
    const selected = branches.find((b) => String(b.id) === id);
    setSelectedBranchId(id);
    setSelectedBranchCode(selected?.branchCode || "");
    resetSavedDetail();
    autoTabRef.current = true; // new filter context -> pick tab automatically again
  };

  const handleFinYearChange = (e) => {
    const value = e.target.value;
    const selected = finYears.find((f) => String(f.finYear) === value);
    setSelectedFinYear(selected?.finYear ?? value);
    setSelectedFinYearId(selected?.finYearId || "");
    setSelectedFinYearRecordId(selected?.id || 0);
    resetSavedDetail();
    autoTabRef.current = true;
  };

  const resetSavedDetail = () => {
    setSavedDetailInfo(null);
    setSavedDetailRows([]);
    setSavedSearchTerm("");
    setSavedPage(1);
  };

  const selectTab = (tab) => {
    autoTabRef.current = false; // user chose explicitly - stop auto-switching
    setActiveTab(tab);
  };

  const loadPendingMappings = async () => {
    try {
      setPendingLoading(true);
      const res = await docTypeMappingAPI.getPendingDocumentTypeMapping({
        branch: selectedBranchId,
        branchCode: selectedBranchCode,
        finYear: selectedFinYear,
        finYearIdentifier: selectedFinYearId,
        orgId: ORG_ID,
      });
      const data = res || [];
      setPendingData(data);
      if (autoTabRef.current) {
        setActiveTab(data.length > 0 ? "pending" : "saved");
      }
    } catch (error) {
      setPendingData([]);
      if (autoTabRef.current) setActiveTab("saved");
      toast.error("Failed to fetch pending mappings");
    } finally {
      setPendingLoading(false);
    }
  };

  // Fetches ALL saved document type mapping records for the org (or just
  // the selected branch, if one is chosen) so the Saved Mappings tab is
  // always ready to view without a separate click.
  const fetchSavedMappings = async () => {
    try {
      setSavedListLoading(true);
      const list = selectedBranchId
        ? await docTypeMappingAPI.getDocumentTypeMappingByOrgId(
            ORG_ID,
            selectedBranchId,
          )
        : await docTypeMappingAPI.getDocumentTypeMappingByOrgId(ORG_ID);

      setSavedRecords(list || []);
      setSavedPage(1);
    } catch (error) {
      console.error("Error fetching saved mapping list:", error);
      toast.error("Failed to load saved mappings");
      setSavedRecords([]);
    } finally {
      setSavedListLoading(false);
    }
  };

  const handleSave = async () => {
    if (!filtersReady) {
      toast.error("Select branch and financial year first");
      return;
    }

    if (pendingData.length === 0) {
      toast.error("No pending mapping rows to save");
      return;
    }

    setSaving(true);

    const details = pendingData.map((item) => ({
      id: item.id || 0,
      active: true,
      branch: selectedBranchId,
      branchCode: item.branchCode || selectedBranchCode,
      docCode: item.docCode,
      finYear: item.finYear || String(selectedFinYear),
      finYearIdentifier: item.finYearIdentifier || selectedFinYearId,
      prefix: item.prefixField,
      screenCode: item.screenCode,
      screenName: item.screenName,
    }));

    const payload = {
      orgId: ORG_ID,
      branch: Number(selectedBranchId),
      branchCode: selectedBranchCode,
      finYear: String(selectedFinYear),
      finYearIdentifier: selectedFinYearId,
      financialYear: selectedFinYearRecordId,
      description: `${selectedBranchCode} ${selectedFinYear} Mapping`,
      active: true,
      cancelRemarks: "",
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      details,
    };

    try {
      const res =
        await docTypeMappingAPI.updateCreateDocumentTypeMapping(payload);

      const status = res?.status === true || res?.statusFlag === "Ok";

      if (status) {
        toast.success(
          res?.paramObjectsMap?.message ||
            "Document Type Mapping saved successfully",
        );
        setPendingData([]);
        resetSavedDetail();
        // Pending is now empty, so the automatic rule naturally lands on
        // the Saved Mappings tab once the refreshed list comes back.
        autoTabRef.current = true;
        setActiveTab("saved");
        await fetchSavedMappings();
      } else {
        toast.error(
          res?.paramObjectsMap?.errorMessage ||
            res?.paramObjectsMap?.message ||
            "Failed to save mapping",
        );
      }
    } catch (error) {
      console.error("Error saving mapping:", error);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.paramObjectsMap?.message ||
        "Save failed! Try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Opens one record from the saved list into the detail table
  const openSavedRecord = (record) => {
    setSavedDetailInfo({
      id: record.id,
      description: record.description,
      branchName: record.branch?.branchName,
      branchCode: record.branch?.branchCode,
      finYear: record.financialYear?.finYear,
      active: record.active,
    });

    setSavedDetailRows(
      (record.documentTypeMappingDetails || []).map((d) => ({
        id: d.id,
        screenName: d.screenName,
        screenCode: d.screenCode,
        docCode: d.docCode,
        prefixField: d.prefix,
        lastNo: d.lastNo,
        active: d.active,
      })),
    );
  };

  // Back from a record's detail view to the searchable saved-list
  const backToSavedList = () => {
    setSavedDetailInfo(null);
    setSavedDetailRows([]);
  };

  const filteredSavedRecords = savedRecords.filter((r) => {
    if (!savedSearchTerm.trim()) return true;
    const term = savedSearchTerm.toLowerCase();
    return (
      r.description?.toLowerCase().includes(term) ||
      r.branch?.branchName?.toLowerCase().includes(term) ||
      r.branch?.branchCode?.toLowerCase().includes(term) ||
      String(r.financialYear?.finYear ?? "")
        .toLowerCase()
        .includes(term)
    );
  });

  const savedTotalPages = Math.max(
    1,
    Math.ceil(filteredSavedRecords.length / SAVED_PAGE_SIZE),
  );
  const safeSavedPage = Math.min(savedPage, savedTotalPages);
  const pagedSavedRecords = filteredSavedRecords.slice(
    (safeSavedPage - 1) * SAVED_PAGE_SIZE,
    safeSavedPage * SAVED_PAGE_SIZE,
  );

  const tabButtonClasses = (tab) =>
    "px-3 py-1.5 text-xs font-semibold rounded-t border-b-2 transition-colors " +
    (activeTab === tab
      ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
      : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200");

  return (
    <div className="p-2 max-w-7xl">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          title="Cancel"
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Doc Mapping
        </h2>

        <button
          onClick={fetchSavedMappings}
          title="Refresh saved mappings"
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        <button
          onClick={handleSave}
          disabled={saving || !filtersReady || pendingData.length === 0}
          title="Save"
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Save className="h-4 w-4" />
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className={labelClasses}>Branch Name</label>
            <select
              value={selectedBranchId}
              onChange={handleBranchChange}
              disabled={branchLoading}
              className={controlClasses}
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>Fin Year</label>
            <select
              value={selectedFinYear}
              onChange={handleFinYearChange}
              disabled={finYearLoading}
              className={controlClasses}
            >
              <option value="">Select Fin Year</option>
              {finYears.map((f) => (
                <option key={f.id ?? f.finYear} value={f.finYear}>
                  {f.finYear}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABS - sit next to each other; auto-picked, but always clickable */}
        {!savedDetailInfo && (
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 mb-3">
            <button
              onClick={() => selectTab("pending")}
              className={tabButtonClasses("pending")}
            >
              Mapping Details
              {pendingData.length > 0 && ` (${pendingData.length})`}
            </button>
            <button
              onClick={() => selectTab("saved")}
              className={tabButtonClasses("saved")}
            >
              Saved Mappings
              {savedRecords.length > 0 && ` (${savedRecords.length})`}
            </button>
          </div>
        )}

        {/* ===== SAVED-MAPPING: SEARCHABLE LIST ===== */}
        {activeTab === "saved" && !savedDetailInfo && (
          <>
            <div className="mb-3">
              <label className={labelClasses}>Search saved mappings</label>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={savedSearchTerm}
                  onChange={(e) => {
                    setSavedSearchTerm(e.target.value);
                    setSavedPage(1);
                  }}
                  placeholder="Search by description, branch or fin year..."
                  className={controlClasses + " pl-7"}
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 py-2 text-center text-white font-semibold w-14">
                      S.No
                    </th>
                    <th className="px-3 py-2 text-left text-white font-semibold">
                      Description
                    </th>
                    <th className="px-3 py-2 text-left text-white font-semibold">
                      Branch
                    </th>
                    <th className="px-3 py-2 text-left text-white font-semibold">
                      Fin Year
                    </th>
                    <th className="px-3 py-2 text-left text-white font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {savedListLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-5 text-gray-500 dark:text-gray-400"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : pagedSavedRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-5 text-gray-500 dark:text-gray-400"
                      >
                        {savedRecords.length === 0
                          ? "No saved document type mapping found"
                          : "No results match your search"}
                      </td>
                    </tr>
                  ) : (
                    pagedSavedRecords.map((record, idx) => (
                      <tr
                        key={record.id ?? idx}
                        onClick={() => openSavedRecord(record)}
                        className="border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                          {(safeSavedPage - 1) * SAVED_PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {record.description}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {record.branch?.branchName} (
                          {record.branch?.branchCode})
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {record.financialYear?.finYear}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {String(record.active)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {filteredSavedRecords.length > SAVED_PAGE_SIZE && (
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-300">
                <span>
                  Page {safeSavedPage} of {savedTotalPages} ·{" "}
                  {filteredSavedRecords.length} records
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSavedPage((p) => Math.max(1, p - 1))}
                    disabled={safeSavedPage <= 1}
                    className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setSavedPage((p) => Math.min(savedTotalPages, p + 1))
                    }
                    disabled={safeSavedPage >= savedTotalPages}
                    className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== SAVED-MAPPING: RECORD DETAIL ===== */}
        {activeTab === "saved" && savedDetailInfo && (
          <>
            <div className="mb-3 flex items-center gap-2">
              <button
                onClick={backToSavedList}
                title="Back to list"
                className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Back to saved mappings
              </span>
            </div>

            <div className="mb-3 px-3 py-2 rounded bg-blue-50 dark:bg-blue-900/20 text-xs text-gray-700 dark:text-gray-200 flex flex-wrap gap-x-4 gap-y-1">
              <span>
                <strong>Description:</strong> {savedDetailInfo.description}
              </span>
              <span>
                <strong>Branch:</strong> {savedDetailInfo.branchName} (
                {savedDetailInfo.branchCode})
              </span>
              <span>
                <strong>Fin Year:</strong> {savedDetailInfo.finYear}
              </span>
              <span>
                <strong>Status:</strong> {String(savedDetailInfo.active)}
              </span>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 py-2 text-center text-white font-semibold w-14">
                      S.No
                    </th>
                    <th className="px-3 py-2 text-left text-white font-semibold">
                      Screen Name
                    </th>
                    <th className="px-3 py-2 text-left text-white font-semibold">
                      Screen Code
                    </th>
                    <th className="px-3 py-2 text-left text-white font-semibold">
                      Doc Code
                    </th>
                    <th className="px-3 py-2 text-left text-white font-semibold">
                      Prefix
                    </th>
                    <th className="px-3 py-2 text-left text-white font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {savedDetailRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-5 text-gray-500 dark:text-gray-400"
                      >
                        No saved mapping details found
                      </td>
                    </tr>
                  ) : (
                    savedDetailRows.map((item, idx) => (
                      <tr
                        key={`${item.screenCode}-${idx}`}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {item.screenName}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {item.screenCode}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {item.docCode}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {item.prefixField}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          {String(item.active)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== PENDING MAPPING ===== */}
        {activeTab === "pending" && (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-2 text-center text-white font-semibold w-14">
                    S.No
                  </th>
                  <th className="px-3 py-2 text-left text-white font-semibold">
                    Screen Name
                  </th>
                  <th className="px-3 py-2 text-left text-white font-semibold">
                    Screen Code
                  </th>
                  <th className="px-3 py-2 text-left text-white font-semibold">
                    Doc Code
                  </th>
                  <th className="px-3 py-2 text-left text-white font-semibold">
                    Prefix
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {pendingLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-5 text-gray-500 dark:text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : pendingData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-5 text-gray-500 dark:text-gray-400"
                    >
                      {filtersReady
                        ? "No Pending Document Type Mapping found"
                        : "Select branch and financial year"}
                    </td>
                  </tr>
                ) : (
                  pendingData.map((item, idx) => (
                    <tr
                      key={`${item.screenCode}-${idx}`}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                        {item.screenName}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                        {item.screenCode}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                        {item.docCode}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                        {item.prefixField}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocTypeMappingPendingList;
