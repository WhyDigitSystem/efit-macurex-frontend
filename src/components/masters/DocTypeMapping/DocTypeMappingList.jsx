import { List, Save, X, ArrowLeft } from "lucide-react";
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
  const [savedInfo, setSavedInfo] = useState(null); // description/branch/finYear of a saved record being viewed
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewingSaved, setViewingSaved] = useState(false);

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
    setSavedInfo(null);
    setViewingSaved(false);
  };

  const handleFinYearChange = (e) => {
    const value = e.target.value;
    const selected = finYears.find((f) => String(f.finYear) === value);
    setSelectedFinYear(selected?.finYear ?? value);
    setSelectedFinYearId(selected?.finYearId || "");
    setSelectedFinYearRecordId(selected?.id || 0);
    setSavedInfo(null);
    setViewingSaved(false);
  };

  const loadPendingMappings = async () => {
    try {
      setLoading(true);
      setViewingSaved(false);
      setSavedInfo(null);
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

  // List button: call getDocumentTypeMappingByOrgId for the selected branch
  // and show its documentTypeMappingDetails in the table.
  const handleListClick = async () => {
    if (!selectedBranchId) {
      toast.error("Select a branch first");
      return;
    }

    try {
      setLoading(true);
      const list = await docTypeMappingAPI.getDocumentTypeMappingByOrgId(
        ORG_ID,
        selectedBranchId,
      );

      if (!list || list.length === 0) {
        toast.error("No saved document type mapping found for this branch");
        setMappingData([]);
        setSavedInfo(null);
        setViewingSaved(true);
        return;
      }

      // If a fin year is selected, prefer the matching entry; else take the first.
      const record =
        (selectedFinYear &&
          list.find(
            (m) => Number(m.financialYear?.finYear) === Number(selectedFinYear),
          )) ||
        list[0];

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

      setViewingSaved(true);
    } catch (error) {
      console.error("Error fetching saved mapping:", error);
      toast.error("Failed to load saved mapping");
    } finally {
      setLoading(false);
    }
  };

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

        {/* SAVED RECORD INFO BANNER */}
        {viewingSaved && savedInfo && (
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
              <strong>Status:</strong> {savedInfo.active}
            </span>
          </div>
        )}

        {/* TAB LABEL */}
        <div className="mb-2">
          <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1">
            {viewingSaved ? "Saved Mapping Details" : "Mapping Details"}
          </span>
        </div>

        {/* TABLE */}
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
                {viewingSaved && (
                  <th className="px-3 py-2 text-left text-white font-semibold">
                    Status
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={viewingSaved ? 6 : 5}
                    className="text-center py-5 text-gray-500 dark:text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : mappingData.length === 0 ? (
                <tr>
                  <td
                    colSpan={viewingSaved ? 6 : 5}
                    className="text-center py-5 text-gray-500 dark:text-gray-400"
                  >
                    {viewingSaved
                      ? "No saved mapping found"
                      : filtersReady
                        ? "No pending mappings found"
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
                    {viewingSaved && (
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                        {item.active}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocTypeMappingPendingList;
