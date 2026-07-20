import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const LocationMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLocations = () => {
    try {
      setLoading(true);

      const dummyLocations = [
        {
          id: 5,
          locationCode: "LOC005",
          locationName: "Bangalore Branch",
          active: true,
        },
        {
          id: 4,
          locationCode: "LOC004",
          locationName: "Chennai Office",
          active: true,
        },
        {
          id: 3,
          locationCode: "LOC003",
          locationName: "Hyderabad Unit",
          active: false,
        },
        {
          id: 2,
          locationCode: "LOC002",
          locationName: "Mumbai Warehouse",
          active: true,
        },
        {
          id: 1,
          locationCode: "LOC001",
          locationName: "Head Office",
          active: true,
        },
      ];

      setLocationData(
        dummyLocations.sort((a, b) => b.id - a.id)
      );

    } catch (error) {
      setLocationData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, [refreshTrigger]);


  const columns = [
    {
      key: "locationCode",
      label: "Location Code",
      accessor: "locationCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "locationName",
      label: "Location Name",
      accessor: "locationName",
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


  return (
    <CommonListViewTable
      title="Location Master"
      subtitle="Manage Locations"
      data={locationData}
      loading={loading}
      columns={columns}
      searchFields={[
        "locationCode",
        "locationName",
      ]}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      itemsPerPageOptions={[5, 10, 25, 50, 100]}
      defaultItemsPerPage={10}
      showSerialNumber
      emptyMessage="No Locations found"
      loadingMessage="Loading Locations..."
      enableRefresh
      onRefresh={loadLocations}
      enableExport
      exportFileName="Locations"
    />
  );
};

export default LocationMasterList;