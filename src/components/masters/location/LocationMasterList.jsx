import { useCallback, useEffect, useRef, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { toast } from "../../../utils/toast";

const normalizeRecord = (r) => ({
  ...r,
  plantName: r.plantId?.branchName || r.plantId?.id || r.plantId || "-",
  locationTypeName: r.locationTypeId?.valueDescription || r.locationTypeId?.id || "-",
  belongsToName: r.belongsToId?.valueDescription || r.belongsToId?.id || "-",
  contactPersonName: r.contactPersonNameId?.employeeName || r.contactPersonNameId?.id || "-",
  partyName: r.partyNameId?.customerName || r.partyNameId?.id || "-",
  isActive: !r.cancelRemarks,
});

const normalizeActive = (value) => value === true || value === "Yes" || value === "Active";

const LocationMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ORG_ID = Number(localStorage.getItem("orgId")) ;
  const ORG_NAME = localStorage.getItem("orgName") ;
  const BRANCH = Number(localStorage.getItem("branchId")) ;
  const prevRefreshRef = useRef(refreshTrigger);

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(ORG_ID, BRANCH);
      const sorted = (res || []).map(normalizeRecord).sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load locations:", error);
      setData([]);
      toast.error("Failed to fetch location records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (prevRefreshRef.current !== refreshTrigger) {
      prevRefreshRef.current = refreshTrigger;
      loadData();
    }
  }, [refreshTrigger, loadData]);

  const columns = [
    { key: "locationId", label: "Location ID", accessor: "locationId", type: "text", noWrap: true },
    { key: "locationName", label: "Location Name", accessor: "locationName", type: "text" },
    { key: "locationType", label: "Location Type", accessor: "locationTypeName", type: "text" },
    { key: "belongsTo", label: "Belongs To", accessor: "belongsToName", type: "text" },
    { key: "plant", label: "Plant", accessor: "plantName", type: "text" },
    { key: "contactPerson", label: "Contact Person", accessor: "contactPersonName", type: "text" },
    { key: "phoneNo", label: "Phone No", accessor: "phoneNo", type: "text", noWrap: true },
    { key: "email", label: "E-mail", accessor: "email", type: "text" },
    {
      key: "active", label: "Status", accessor: "isActive",
      render: (value) => {
        const isActive = normalizeActive(value);
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    { key: "actions", label: "Actions", type: "actions", align: "center", width: "90px" },
  ];

  const searchFields = ["locationId", "locationName", "locationTypeName", "belongsToName", "plantName"];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active", filterFn: (item) => normalizeActive(item.isActive) },
    { value: "inactive", label: "Inactive", filterFn: (item) => !normalizeActive(item.isActive) },
  ];

  return (
    <CommonListViewTable
      title="Location Master"
      subtitle="Manage Locations"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={(row) => onEdit(row)}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Location records found"
      loadingMessage="Loading Location records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="LocationMaster"
    />
  );
};

export default LocationMasterList;
