import { useCallback, useEffect, useRef, useState } from "react";
import partyAccountMappingAPI from "../../../api/partyAccountMappingAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const normalizeActive = (value) => value === true || value === "Active";

const normalizeRecord = (r) => {
  const details = Array.isArray(r.details) ? r.details : [];
  return {
    ...r,
    docId: r.docId || r.id || "-",
    branchName: r.branch?.branchName || r.branch?.id || "-",
    categoryName: r.category?.listDescription || r.category?.id || "-",
    mappingCount: details.length,
    isActive: normalizeActive(r.active),
  };
};

const PartyAccountMappingList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [mappingData, setMappingData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH = Number(localStorage.getItem("branchId"));
  const prevRefreshRef = useRef(refreshTrigger);

  const loadMappings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await partyAccountMappingAPI.getMappingByOrgId(
        ORG_ID,
        BRANCH,
      );
      const sortedData = (response || [])
        .map(normalizeRecord)
        .sort((a, b) => (b.id || 0) - (a.id || 0));
      setMappingData(sortedData);
    } catch (error) {
      console.error("Failed to load party account mappings:", error);
      setMappingData([]);
      toast.error("Failed to fetch party account mappings");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  useEffect(() => {
    if (prevRefreshRef.current !== refreshTrigger) {
      prevRefreshRef.current = refreshTrigger;
      loadMappings();
    }
  }, [refreshTrigger, loadMappings]);

  const columns = [
    {
      key: "docId",
      label: "Doc Id",
      accessor: "docId",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
      type: "date",
    },
    {
      key: "asOnDate",
      label: "As On Date",
      accessor: "asOnDate",
      type: "date",
    },
    {
      key: "branch",
      label: "Branch",
      accessor: "branchName",
      type: "text",
    },
    {
      key: "category",
      label: "Category",
      accessor: "categoryName",
      type: "text",
    },
    {
      key: "mappingCount",
      label: "Mappings",
      accessor: "mappingCount",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "isActive",
      render: (value) => {
        const isActive = normalizeActive(value);
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  const searchFields = ["docId", "branchName", "categoryName"];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active", filterFn: (item) => normalizeActive(item.isActive) },
    { value: "inactive", label: "Inactive", filterFn: (item) => !normalizeActive(item.isActive) },
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Mapping Of Party To Account"
        subtitle="Manage Party To Account Mappings"
        data={mappingData}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        filterOptions={filterOptions}
        defaultFilter="all"
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={onEdit}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage="No Party To Account Mappings found"
        loadingMessage="Loading Party To Account Mappings..."
        enableRefresh={true}
        onRefresh={loadMappings}
        enableExport={true}
        exportFileName="PartyAccountMappings"
      />
    </div>
  );
};

export default PartyAccountMappingList;
