import React, { useCallback, useEffect, useState } from "react";
import masterAPI from "../../../api/cityAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const CityMasterList = ({ onAddNew, onEdit,onBack }) => {
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  const loadCities = useCallback(async () => {
    try {
      setLoading(true);

      const response = await masterAPI.getCities(ORG_ID);

      let cities = [];

      if (Array.isArray(response)) {
        cities = response;
      } else if (response?.paramObjectsMap?.cityVO) {
        cities = response.paramObjectsMap.cityVO;
      } else if (response?.data) {
        cities = response.data;
      }

      cities.sort((a, b) => (b.id || 0) - (a.id || 0));

      setCityData(cities);
    } catch (error) {
      console.error("Failed to load cities:", error);
      setCityData([]);
      toast.error("Failed to fetch Cities");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  const handleEdit = (city) => {
    onEdit(city);
  };

  const columns = [
    {
      key: "cityCode",
      label: "City Code",
      accessor: "cityCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "cityName",
      label: "City Name",
      accessor: "cityName",
      type: "text",
    },
    {
      key: "country",
      label: "Country",
      accessor: "country",
      type: "text",
    },
    {
      key: "state",
      label: "State",
      accessor: "state",
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
    "cityCode",
    "cityName",
    "country",
    "state",
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
      title="City"
      data={cityData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Cities found"
      loadingMessage="Loading Cities..."
      enableRefresh={true}
      onRefresh={loadCities}
      enableExport={true}
      exportFileName="Cities"
    />
  );
};

export default CityMasterList;