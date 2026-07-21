import { useCallback, useEffect, useState } from "react";
import { stateAPI } from "../../../api/stateAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const StateMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [stateData, setStateData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  const loadStates = useCallback(async () => {
    try {
      setLoading(true);

      const response = await stateAPI.getStates(ORG_ID);

      let states = [];

      if (Array.isArray(response)) {
        states = response;
      } else if (response?.paramObjectsMap?.stateVO) {
        states = response.paramObjectsMap.stateVO;
      } else if (response?.data) {
        states = response.data;
      }

      states.sort((a, b) => (b.id || 0) - (a.id || 0));

      setStateData(states);
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
  }, [loadStates]);

  const columns = [
    {
      key: "stateCode",
      label: "State Code",
      accessor: "stateCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "stateName",
      label: "State Name",
      accessor: "stateName",
      type: "text",
    },
    {
      key: "stateNumber",
      label: "State Number",
      accessor: "stateNumber",
      type: "text",
    },
    {
      key: "country",
      label: "Country",
      accessor: "country",
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
      statusVariants: {
        true: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        false: {
          label: "Inactive",
          className:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        },
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
      field: null,
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
