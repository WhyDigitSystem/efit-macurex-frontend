import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import currencyAPI from "../../../api/currencyAPI";
import { toast } from "../../../utils/toast";

const CurrencyList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [currencyData, setCurrencyData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  console.log(ORG_ID);
  const loadCurrencies = useCallback(async () => {
    try {
      setLoading(true);

      const rawList = await currencyAPI.getCurrencies(ORG_ID);

      console.log("Currency List:", rawList);

      const mappedData = rawList.map((item) => ({
        ...item,
        country: item.country?.countryName || "",
        active: item.active === "Active",
      }));

      const sortedData = mappedData.sort((a, b) => (b.id || 0) - (a.id || 0));

      setCurrencyData(sortedData);
    } catch (error) {
      console.error("Failed to load currencies:", error);
      setCurrencyData([]);
      toast.error("Failed to fetch currencies");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies, refreshTrigger]);

  const handleEdit = (item) => {
    onEdit(item);
  };

  const columns = [
    {
      key: "country",
      label: "Country",
      accessor: "country",
      type: "text",
      noWrap: true,
    },
    {
      key: "mainCurrency",
      label: "Main Currency",
      accessor: "mainCurrency",
      type: "text",
    },
    {
      key: "mainCurrencySymbol",
      label: "Main Currency Symbol",
      accessor: "mainCurrencySymbol",
      type: "text",
    },
    {
      key: "subCurrency",
      label: "Sub Currency",
      accessor: "subCurrency",
      type: "text",
    },
    {
      key: "subSymbol",
      label: "Sub Symbol",
      accessor: "subSymbol",
      type: "text",
    },
    {
      key: "currency",
      label: "Currency",
      accessor: "currency",
      type: "text",
    },
    {
      key: "currencyRepresentation",
      label: "Representation",
      accessor: "currencyRepresentation",
      type: "text",
    },
    {
      key: "currencyInteger",
      label: "Currency Integer",
      accessor: "currencyInteger",
      type: "text",
    },
    {
      key: "currencyDecimal",
      label: "Currency Decimal",
      accessor: "currencyDecimal",
      type: "text",
    },
    {
      key: "menetaryUnit",
      label: "Monetary Unit",
      accessor: "menetaryUnit",
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
    "country",
    "mainCurrency",
    "subCurrency",
    "currency",
    "menetaryUnit",
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
      filterValue: true,
      activeValue: true,
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: false,
      activeValue: true,
    },
  ];

  return (
    <CommonListViewTable
      title="Currency"
      data={currencyData}
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
      emptyMessage="No Currencies found"
      loadingMessage="Loading Currencies..."
      enableRefresh={true}
      onRefresh={loadCurrencies}
      enableExport={true}
      exportFileName="Currency List"
    />
  );
};

export default CurrencyList;
