import { useCallback, useEffect, useState } from "react";
import exchangeRateUpdateAPI from "../../../api/exchangeRateUpdateAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const ExchangeRateUpdateList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [rateData, setRateData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadRates = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await exchangeRateUpdateAPI.getExchangeRateUpdateByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setRateData(sortedData);
    } catch (error) {
      console.error("Failed to load exchange rate updates:", error);
      setRateData([]);
      toast.error("Failed to fetch exchange rate updates");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadRates();
  }, [loadRates, refreshTrigger]);

  const columns = [
    {
      key: "currencyName",
      label: "Currency Name",
      accessor: "currencyName",
      type: "text",
    },
    {
      key: "exchangeRate",
      label: "Exchange Rate",
      accessor: "exchangeRate",
      type: "text",
    },
    {
      key: "exchangeDateFrom",
      label: "Exchange Date From",
      accessor: "exchangeDateFrom",
      type: "date",
    },
    {
      key: "exchangeDateTo",
      label: "Exchange Date To",
      accessor: "exchangeDateTo",
      type: "date",
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

  const searchFields = ["currencyName"];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Exchange Rate Update"
        data={rateData}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={onEdit}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage="No Exchange Rate Updates found"
        loadingMessage="Loading Exchange Rate Updates..."
        enableRefresh={true}
        onRefresh={loadRates}
        enableExport={true}
        exportFileName="ExchangeRateUpdates"
      />
    </div>
  );
};

export default ExchangeRateUpdateList;
