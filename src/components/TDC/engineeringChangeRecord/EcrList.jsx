import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import engineeringChangeRecordAPI from "../../../api/TDC/engineeringChangeRecordAPI";
import { useToast } from "../../../components/Toast/ToastContext";

const EcrList = ({ onAddNew, onEdit, onBack, refreshTrigger, loadingEdit }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));
  const [branchId, setBranchId] = useState(localStorage.getItem("branchId"));

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await engineeringChangeRecordAPI.getEngineeringChangeRecordByOrgId(
        orgId,
        branchId,
      );
      const transformedData = (data || []).map((item) => ({
        id: item.id,
        ecrNo: item.ecrNo || item.id,
        ecrDate: item.docDate
          ? String(item.docDate).slice(0, 10)
          : item.ecrDate
            ? String(item.ecrDate).slice(0, 10)
            : "",
        plantId: item.branch?.branchName || item.branch?.branchCode || item.plantName || item.branch?.id || "",
        fromDepartment: item.fromDepartment,
        customerName: item.customerName || item.customer || "",
        requestedBy: item.requestedBy?.employeeName || item.requestedBy || "",
        reasonForChange: item.reasonForChange || "",
        productDescription: item.productDescription || item.partDescription || "",
        engineeringDrawingChange: item.engineeringDrawingChange || "",
        bomChange: item.bomChange || "",
        customerApproval: item.customerApproval || "",
        active: item.active,
        _raw: item,
      }));
      transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(transformedData);
    } catch (error) {
      console.error("Failed to load engineering change records:", error);
      setRecords([]);
      addToast("Failed to fetch Engineering Change Records", "error");
    } finally {
      setLoading(false);
    }
  }, [orgId, branchId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "ecrNo",
      label: "ECR No",
      accessor: (row) => row.ecrNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "ecrDate",
      label: "Date",
      accessor: (row) => row.ecrDate,
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: (row) => row.plantId,
      type: "text",
    },
    {
      key: "fromDepartment",
      label: "From Department",
      accessor: (row) => row.fromDepartment,
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: (row) => row.customerName,
      type: "text",
    },
    {
      key: "requestedBy",
      label: "Requested By",
      accessor: (row) => row.requestedBy,
      type: "text",
    },
    {
      key: "reasonForChange",
      label: "Reason For Change",
      accessor: (row) => row.reasonForChange,
      type: "text",
    },
    {
      key: "productDescription",
      label: "Product Description",
      accessor: (row) => row.productDescription,
      type: "text",
    },
    {
      key: "engineeringDrawingChange",
      label: "Engg. Drawing Change",
      accessor: (row) => row.engineeringDrawingChange,
      type: "text",
    },
    {
      key: "bomChange",
      label: "BOM Change",
      accessor: (row) => row.bomChange,
      type: "text",
    },
    {
      key: "customerApproval",
      label: "Customer Approval",
      accessor: (row) => row.customerApproval,
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
      statusVariants: {
        Active: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        Inactive: {
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
    "ecrNo",
    "ecrDate",
    "plantId",
    "fromDepartment",
    "customerName",
    "requestedBy",
    "reasonForChange",
    "productDescription",
    "engineeringDrawingChange",
    "bomChange",
    "customerApproval",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
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
    <>
      {loadingEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-lg px-6 py-4 shadow-xl text-sm text-gray-700 dark:text-gray-200 flex items-center gap-3">
            <span className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading details...
          </div>
        </div>
      )}
      <CommonListViewTable
        title="Engineering Change Record"
        data={records}
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
        emptyMessage="No Engineering Change Records found"
        loadingMessage="Loading Engineering Change Records..."
        enableRefresh={true}
        onRefresh={loadRecords}
        enableExport={true}
        exportFileName="EngineeringChangeRecords"
      />
    </>
  );
};

export default EcrList;
