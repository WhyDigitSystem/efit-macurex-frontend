import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const LocationMasterList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLocations = () => {
    setLoading(true);

    try {
      const dummyLocations = [
        {
          id: 10,
          locationCode: "LOC010",
          locationName: "Head Office",
          branch: "Corporate",
          company: "ABC Pvt Ltd",
          startDate: "01-01-2024",
          endDate: "-",
          active: true,
        },
        {
          id: 9,
          locationCode: "LOC009",
          locationName: "Bangalore Branch",
          branch: "South Zone",
          company: "ABC Pvt Ltd",
          startDate: "10-02-2024",
          endDate: "-",
          active: true,
        },
        {
          id: 8,
          locationCode: "LOC008",
          locationName: "Mysore Office",
          branch: "South Zone",
          company: "ABC Pvt Ltd",
          startDate: "20-03-2024",
          endDate: "-",
          active: true,
        },
        {
          id: 7,
          locationCode: "LOC007",
          locationName: "Chennai Branch",
          branch: "Tamil Nadu",
          company: "ABC Pvt Ltd",
          startDate: "15-04-2024",
          endDate: "-",
          active: true,
        },
        {
          id: 6,
          locationCode: "LOC006",
          locationName: "Hyderabad Office",
          branch: "Telangana",
          company: "ABC Pvt Ltd",
          startDate: "01-05-2024",
          endDate: "-",
          active: true,
        },
        {
          id: 5,
          locationCode: "LOC005",
          locationName: "Pune Warehouse",
          branch: "Maharashtra",
          company: "ABC Pvt Ltd",
          startDate: "12-06-2024",
          endDate: "30-12-2025",
          active: false,
        },
        {
          id: 4,
          locationCode: "LOC004",
          locationName: "Mumbai Office",
          branch: "Maharashtra",
          company: "ABC Pvt Ltd",
          startDate: "08-07-2024",
          endDate: "-",
          active: true,
        },
        {
          id: 3,
          locationCode: "LOC003",
          locationName: "Delhi Office",
          branch: "North Zone",
          company: "ABC Pvt Ltd",
          startDate: "01-08-2024",
          endDate: "-",
          active: true,
        },
        {
          id: 2,
          locationCode: "LOC002",
          locationName: "Kolkata Branch",
          branch: "East Zone",
          company: "ABC Pvt Ltd",
          startDate: "10-09-2024",
          endDate: "-",
          active: false,
        },
        {
          id: 1,
          locationCode: "LOC001",
          locationName: "Ahmedabad Office",
          branch: "West Zone",
          company: "ABC Pvt Ltd",
          startDate: "05-10-2024",
          endDate: "-",
          active: true,
        },
      ];

      setLocationData(dummyLocations.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error(error);
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
      key: "branch",
      label: "Branch",
      accessor: "branch",
      type: "text",
    },
    {
      key: "company",
      label: "Company",
      accessor: "company",
      type: "text",
    },
    {
      key: "startDate",
      label: "Start Date",
      accessor: "startDate",
      type: "text",
    },
    {
      key: "endDate",
      label: "End Date",
      accessor: "endDate",
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
      title="Location"
      data={locationData}
      loading={loading}
      columns={columns}
      searchFields={[
        "locationCode",
        "locationName",
        "branch",
        "company",
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