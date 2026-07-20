import React, { useCallback, useEffect, useState } from "react";
import { masterAPI } from "../../../api/customerAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const CountryMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  const loadCountries = useCallback(async () => {
    try {
      setLoading(true);

      const response = await masterAPI.getCountries(ORG_ID);

      const sortedCountries = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setCountryData(sortedCountries);
    } catch (error) {
      console.error("Failed to load countries:", error);
      setCountryData([]);
      toast.error("Failed to fetch Countries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries, refreshTrigger]);

  const handleEdit = (country) => {
    onEdit(country);
  };

  const columns = [
    {
      key: "countryCode",
      label: "Country Code",
      accessor: "countryCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "countryName",
      label: "Country Name",
      accessor: "countryName",
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

  const searchFields = ["countryCode", "countryName"];

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
      title="Country Master"
      subtitle="Manage Countries"
      data={countryData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      itemsPerPageOptions={[5, 10, 25, 50, 100]}
      defaultItemsPerPage={10}
      showSerialNumber={true}
      emptyMessage="No Countries found"
      loadingMessage="Loading Countries..."
      enableRefresh={true}
      onRefresh={loadCountries}
      enableExport={true}
      exportFileName="Countries"
    />
  );
};

export default CountryMasterList;
