import { List, Save, X, ArrowLeft, Search, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
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

  const [mappingData, setMappingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ---- Saved-mapping (List icon) view state ----
  // viewingSaved: whether we're in "saved mapping" mode at all (list or detail)
  const [viewingSaved, setViewingSaved] = useState(false);
  // savedRecords: the full list of header records returned by getDocumentTypeMappingByOrgId
  const [savedRecords, setSavedRecords] = useState([]);
  const [savedListLoading, setSavedListLoading] = useState(false);
  const [savedSearchTerm, setSavedSearchTerm] = useState("");
  // savedInfo: the currently opened record's header info (null while browsing the list)
  const [savedInfo, setSavedInfo] = useState(null);

  useEffect(() => {
    fetchBranches();
    fetchFinYears();
  }, []);

  const filtersReady =
    selectedBranchId &&
    selectedBranchCode &&
    selectedFinYear &&
    selectedFinYearId;

  useEffect(() => {
    if (filtersReady) {
      loadPendingMappings();
    } else {
      setMappingData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedBranchId,
    selectedBranchCode,
    selectedFinYear,
    selectedFinYearId,
  ]);

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
    exitSavedView();
  };

  const handleFinYearChange = (e) => {
    const value = e.target.value;
    const selected = finYears.find((f) => String(f.finYear) === value);
    setSelectedFinYear(selected?.finYear ?? value);
    setSelectedFinYearId(selected?.finYearId || "");
    setSelectedFinYearRecordId(selected?.id || 0);
    exitSavedView();
  };

  // Leaves "saved mapping" mode entirely and goes back to the pending-mapping screen
  const exitSavedView = () => {
    setViewingSaved(false);
    setSavedInfo(null);
    setSavedRecords([]);
    setSavedSearchTerm("");
  };

  const loadPendingMappings = async () => {
    try {
      setLoading(true);
      exitSavedView();
      const res = await docTypeMappingAPI.getPendingDocumentTypeMapping({
        branch: selectedBranchId,
        branchCode: selectedBranchCode,
        finYear: selectedFinYear,
        finYearIdentifier: selectedFinYearId,
        orgId: ORG_ID,
      });
      setMappingData(res || []);
    } catch (error) {
      setMappingData([]);
      toast.error("Failed to fetch pending mappings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!filtersReady) {
      toast.error("Select branch and financial year first");
      return;
    }

    if (mappingData.length === 0) {
      toast.error("No pending mapping rows to save");
      return;
    }

    setSaving(true);

    const details = mappingData.map((item) => ({
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
        setMappingData([]);
        loadPendingMappings();
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

  // List (three-line) icon: no branch/finYear required.
  // Fetches ALL saved document type mapping records for the org and shows
  // them as a searchable list. Clicking a record drills into its details.
  const handleListClick = async () => {
    try {
      setSavedListLoading(true);
      setViewingSaved(true);
      setSavedInfo(null);
      setSavedSearchTerm("");
      setMappingData([]);

      // Pass branch only if one happens to be selected; otherwise fetch
      // every record for the org so the user can browse/search freely.
      const list = selectedBranchId
        ? await docTypeMappingAPI.getDocumentTypeMappingByOrgId(
            ORG_ID,
            selectedBranchId,
          )
        : await docTypeMappingAPI.getDocumentTypeMappingByOrgId(ORG_ID);

      setSavedRecords(list || []);

      if (!list || list.length === 0) {
        toast.error("No saved document type mapping found");
      }
    } catch (error) {
      console.error("Error fetching saved mapping list:", error);
      toast.error("Failed to load saved mappings");
      setSavedRecords([]);
    } finally {
      setSavedListLoading(false);
    }
  };

  // Opens one record from the saved list into the detail table
  const openSavedRecord = (record) => {
    setSavedInfo({
      id: record.id,
      description: record.description,
      branchName: record.branch?.branchName,
      branchCode: record.branch?.branchCode,
      finYear: record.financialYear?.finYear,
      active: record.active,
    });

    setMappingData(
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
    setSavedInfo(null);
    setMappingData([]);
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

  const showingSavedList = viewingSaved && !savedInfo;
  const showingSavedDetail = viewingSaved && !!savedInfo;

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
          onClick={handleListClick}
          title="List saved mapping"
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          onClick={handleSave}
          disabled={
            saving || !filtersReady || mappingData.length === 0 || viewingSaved
          }
          title="Save"
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Save className="h-4 w-4" />
        </button>

        {viewingSaved && (
          <button
            onClick={exitSavedView}
            title="Close saved mapping view"
            className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {/* FILTERS (only relevant to the pending-mapping screen) */}
        {!viewingSaved && (
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
        )}

        {/* ===== SAVED-MAPPING: SEARCHABLE LIST ===== */}
        {showingSavedList && (
          <>
            <div className="mb-3">
              <label className={labelClasses}>Search saved mappings</label>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={savedSearchTerm}
                  onChange={(e) => setSavedSearchTerm(e.target.value)}
                  placeholder="Search by description, branch or fin year..."
                  className={controlClasses + " pl-7"}
                />
              </div>
            </div>

            <div className="mb-2">
              <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1">
                Saved Mappings ({filteredSavedRecords.length})
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
                  ) : filteredSavedRecords.length === 0 ? (
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
                    filteredSavedRecords.map((record, idx) => (
                      <tr
                        key={record.id ?? idx}
                        onClick={() => openSavedRecord(record)}
                        className="border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                          {idx + 1}
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
          </>
        )}

        {/* ===== SAVED-MAPPING: RECORD DETAIL ===== */}
        {showingSavedDetail && (
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
                <strong>Description:</strong> {savedInfo.description}
              </span>
              <span>
                <strong>Branch:</strong> {savedInfo.branchName} (
                {savedInfo.branchCode})
              </span>
              <span>
                <strong>Fin Year:</strong> {savedInfo.finYear}
              </span>
              <span>
                <strong>Status:</strong> {String(savedInfo.active)}
              </span>
            </div>

            <div className="mb-2">
              <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1">
                Saved Mapping Details
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
                  {mappingData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-5 text-gray-500 dark:text-gray-400"
                      >
                        No saved mapping details found
                      </td>
                    </tr>
                  ) : (
                    mappingData.map((item, idx) => (
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

        {/* ===== PENDING MAPPING (default) ===== */}
        {!viewingSaved && (
          <>
            <div className="mb-2">
              <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1">
                Mapping Details
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
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-5 text-gray-500 dark:text-gray-400"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : mappingData.length === 0 ? (
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
                    mappingData.map((item, idx) => (
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
          </>
        )}
      </div>
    </div>
  );
};

export default DocTypeMappingPendingList;
