import { useCallback, useEffect, useState } from "react";
import flashNcReportAPI from "../../../api/quality/flashNcReportAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const FlashNcReportList = ({ onAddNew, onEdit, onBack }) => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"), 10);
  const BRANCH_ID = parseInt(localStorage.getItem("branchId"), 10);

  /* ---------------------------------------------------------
     Load reports.
     Response shape:
       response.data.paramObjectsMap.flashNCReportList = [ ... ]
  --------------------------------------------------------- */
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);

      const response = await flashNcReportAPI.getByOrgId(ORG_ID, BRANCH_ID);

      const data = response?.data ?? response;

      const raw =
        data?.paramObjectsMap?.flashNCReportList ||
        data?.paramObjectsMap?.flashNCReportVO ||
        (Array.isArray(data) ? data : []);

      // Flatten nested objects into plain fields for the table.
      const reports = (raw || []).map((r) => ({
        ...r,
        frNo: r.docId || "",
        frDate: r.docDate || "",
        branchName: r.branch?.branchName || "",
        belongsToDesc: r.belongsTo?.description || "",
        referenceDesc: r.reference?.description || "",
        fromDeptName: r.fromDept?.departmentName || "",
        toDeptName: r.toDept?.departmentName || "",
        itemCode: r.item?.itemCode || "",
        itemDescription: r.item?.itemDescription || "",
        disposalDesc: r.disposal?.description || "",
        inspectedByName: r.inspectedBy?.employeeName || "",
        supplierName: r.supplierName || r.supplier || "",
      }));

      reports.sort((a, b) => (b.id || 0) - (a.id || 0));

      setReportData(reports);
    } catch (error) {
      console.error("Failed to load Flash/NC Reports:", error);
      setReportData([]);
      toast.error("Failed to fetch Flash/NC Reports");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  /* ---------------------------------------------------------
     Edit.
  --------------------------------------------------------- */
  const handleEdit = (report) => {
    onEdit(report);
  };

  /* ---------------------------------------------------------
     Table columns.
  --------------------------------------------------------- */
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
      label: "Supplier",
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
      key: "disposalDesc",
      label: "Disposal",
      accessor: "disposalDesc",
      type: "text",
    },
    {
      key: "active",
      label: "Active",
      accessor: "active",
      type: "status",
      statusVariants: {
        Active: {
          label: "Active",
          className: "bg-green-100 text-green-700",
        },
        Inactive: {
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

  /* ---------------------------------------------------------
     Search.
  --------------------------------------------------------- */
  const searchFields = [
    "frNo",
    "itemCode",
    "supplierName",
    "mrinSCGRNNO",
    "poNo",
    "problemStatus",
    "disposalDesc",
  ];

  /* ---------------------------------------------------------
     Filters.
  --------------------------------------------------------- */
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