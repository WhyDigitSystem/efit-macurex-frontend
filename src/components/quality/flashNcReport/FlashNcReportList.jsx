import { useCallback, useEffect, useState } from "react";
import flashNcReportAPI from "../../../api/quality/flashNcReportAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const FlashNcReportList = ({ onAddNew, onEdit, onBack }) => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  /*
   * Load reports.
   */
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);

      const response = await flashNcReportAPI.getAll(ORG_ID);

      let reports = [];

      if (Array.isArray(response)) {
        reports = response;
      } else if (response?.paramObjectsMap?.flashNcReportVO) {
        reports = response.paramObjectsMap.flashNcReportVO;
      } else if (Array.isArray(response?.data)) {
        reports = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        reports = response.data.data;
      }

      reports.sort((a, b) => (b.id || 0) - (a.id || 0));

      setReportData(reports);
    } catch (error) {
      console.error("Failed to load Flash/NC Reports:", error);

      setReportData([]);

      toast.error("Failed to fetch Flash/NC Reports");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  /*
   * Edit.
   */
  const handleEdit = (report) => {
    onEdit(report);
  };

  /*
   * Table columns.
   */
  const columns = [
    {
      key: "frNo",
      label: "FR No",
      accessor: "frNo",
      type: "text",
      noWrap: true,
    },

    {
      key: "frDate",
      label: "FR Date",
      accessor: "frDate",
      type: "text",
      noWrap: true,
    },

    {
      key: "itemCode",
      label: "Item Code",
      accessor: "itemCode",
      type: "text",
      noWrap: true,
    },

    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: "supplierName",
      type: "text",
    },

    {
      key: "problemStatus",
      label: "Problem Status",
      accessor: "problemStatus",
      type: "text",
    },

    {
      key: "ncQty",
      label: "NC Qty",
      accessor: "ncQty",
      type: "text",
      align: "right",
    },

    {
      key: "disposal",
      label: "Disposal",
      accessor: "disposal",
      type: "text",
    },

    {
      key: "status",
      label: "Status",
      accessor: "status",
      type: "status",

      statusVariants: {
        Open: {
          label: "Open",
          className: "bg-yellow-100 text-yellow-700",
        },

        Approved: {
          label: "Approved",
          className: "bg-green-100 text-green-700",
        },

        Rejected: {
          label: "Rejected",
          className: "bg-red-100 text-red-700",
        },

        Closed: {
          label: "Closed",
          className: "bg-gray-100 text-gray-700",
        },
      },
    },

    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",

      statusVariants: {
        true: {
          label: "Active",
          className: "bg-green-100 text-green-700",
        },

        false: {
          label: "Inactive",
          className: "bg-red-100 text-red-700",
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

  /*
   * Search.
   */
  const searchFields = [
    "frNo",
    "itemCode",
    "supplierName",
    "supplierCode",
    "mrnScGrnNo",
    "poNo",
    "problemStatus",
    "disposal",
  ];

  /*
   * Filters.
   */
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
      title="Flash/NC Report"
      data={reportData}
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
      emptyMessage="No Flash/NC Reports found"
      loadingMessage="Loading Flash/NC Reports..."
      enableRefresh={true}
      onRefresh={loadReports}
      enableExport={true}
      exportFileName="Flash_NC_Reports"
    />
  );
};

export default FlashNcReportList;
