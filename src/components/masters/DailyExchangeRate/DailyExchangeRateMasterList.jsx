import { useCallback, useEffect, useRef, useState } from "react";
import dailyExchangeRateAPI from "../../../api/dailyExchangeRateAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const DailyExchangeRateMasterList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [rateData, setRateData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH = Number(localStorage.getItem("branchId")||1000000001);
  const prevRefreshRef = useRef(refreshTrigger);

  const loadRates = useCallback(async () => {
    if (!ORG_ID || !BRANCH) return;
    try {
      setLoading(true);

      const response = await dailyExchangeRateAPI.getDailyExRateByOrgId(
        ORG_ID,
        BRANCH,
      );

      const flattened = (response || []).map((item) => ({
        ...item,
        currencyCode: item.currency?.currency || "",
        currencyDescription: item.currency?.currencyDescription || "",
        year: item.year != null ? String(item.year) : "",
      }));

      const sortedData = flattened.sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setRateData(sortedData);
    } catch (error) {
      console.error("Failed to load exchange rates:", error);
      setRateData([]);
      toast.error("Failed to fetch exchange rates");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  useEffect(() => {
    if (prevRefreshRef.current !== refreshTrigger) {
      prevRefreshRef.current = refreshTrigger;
      loadRates();
    }
  }, [refreshTrigger, loadRates]);

  const columns = [
    {
      key: "currencyCode",
      label: "Currency",
      accessor: "currencyCode",
      type: "text",
    },
    {
      key: "sellingExRate",
      label: "Selling Ex.Rate",
      accessor: "sellingExRate",
      type: "text",
    },
    {
      key: "buyingExRate",
      label: "Buying Ex.Rate",
      accessor: "buyingExRate",
      type: "text",
    },
    {
      key: "month",
      label: "Month",
      accessor: "month",
      type: "text",
    },
    {
      key: "year",
      label: "Year",
      accessor: "year",
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

  const searchFields = ["currencyCode", "month", "year"];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Daily Exchange Rate"
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
        emptyMessage="No Exchange Rates found"
        loadingMessage="Loading Exchange Rates..."
        enableRefresh={true}
        onRefresh={loadRates}
        enableExport={true}
        exportFileName="DailyExchangeRates"
      />
    </div>
  );
};

export default DailyExchangeRateMasterList;
