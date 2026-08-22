import { useCallback, useEffect, useState } from "react";
import stateAPI from "../../../api/stateAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const StateMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [stateData, setStateData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadStates = useCallback(async () => {
    try {
      setLoading(true);

      const response = await stateAPI.getStates(ORG_ID);

      const sortedStates = (response || [])
        .map((item) => ({
          ...item,
          // Keep the country object for editing
          countryObject: item.country || null,
          // Use countryName for display
          countryName: item.country?.countryName || "",
        }))
        .sort((a, b) => (b.id || 0) - (a.id || 0));

      setStateData(sortedStates);
    } catch (error) {
      console.error("Failed to load states:", error);
      setStateData([]);
      toast.error("Failed to fetch States");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadStates();
  }, [loadStates, refreshTrigger]);

  const columns = [
    {
      key: "stateCode",
      label: "Code",
      accessor: "stateCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "stateName",
      label: "State",
      accessor: "stateName",
      type: "text",
    },
    {
      key: "stateNumber",
      label: "Number",
      accessor: "stateNumber",
      type: "text",
    },
    {
      key: "country",
      label: "Country",
      accessor: "countryName",
      type: "text",
    },
    {
      key: "region",
      label: "Region",
      accessor: "region",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  const searchFields = [
    "stateCode",
    "stateName",
    "stateNumber",
    "country",
    "region",
  ];

  const filterOptions = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: "active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "inactive",
      activeValue: "Active",
    },
  ];

  return (
    <CommonListViewTable
      title="State"
      data={stateData}
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
      emptyMessage="No States found"
      loadingMessage="Loading States..."
      enableRefresh={true}
      onRefresh={loadStates}
      enableExport={true}
      exportFileName="States"
    />
  );
};

export default StateMasterList;
