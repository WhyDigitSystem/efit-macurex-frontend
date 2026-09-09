import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import engineeringDeviationRequestAPI from "../../../api/TDC/engineeringDeviationRequestAPI";
import { toast } from "../../../utils/toast";

const EngineeringDeviationRequestList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    if (!ORG_ID) return;
    try {
      setLoading(true);
      const response = await engineeringDeviationRequestAPI.getEdrByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      console.log("API Response:", response);

      // Extract data from response
      let data = [];
      if (response?.paramObjectsMap?.engineeringDeviationRequestVO) {
        data = response.paramObjectsMap.engineeringDeviationRequestVO;
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response?.data?.paramObjectsMap?.engineeringDeviationRequestVO) {
        data = response.data.paramObjectsMap.engineeringDeviationRequestVO;
      }

      // Map the data to match the table columns
      const mappedData = data.map((item) => ({
        id: item.id,
        requestNo: item.docId || "",
        date: item.docDate || "",
        to: item.toDepartment?.departmentName || item.toDepartment || "",
        deviationRequestedBy: item.requestedBy?.employeeName || item.requestedBy || "",
        customerId: item.customerId || "",
        customerName: item.customerId || "",
        productName: item.productName || "",
        partDescription: item.partDescription || "",
        partNoDrawingNo: item.partNo || "",
        quantityReceived: item.quantityReceived || "",
        supplier: item.supplier || "",
        active: item.active ? "Active" : "Inactive",
        // Store full data for edit
        _fullData: item,
      }));

      // Sort by ID descending (newest first)
      mappedData.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(mappedData);
    } catch (error) {
      console.error("Failed to load engineering deviation requests:", error);
      setRecords([]);
      toast.error("Failed to fetch Engineering Deviation Requests");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "requestNo",
      label: "Request No",
      accessor: "requestNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
    },
    {
      key: "to",
      label: "To",
      accessor: "to",
      type: "text",
    },
    {
      key: "deviationRequestedBy",
      label: "Deviation Requested By",
      accessor: "deviationRequestedBy",
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer",
      accessor: "customerName",
      type: "text",
    },
    {
      key: "productName",
      label: "Product Name",
      accessor: "productName",
      type: "text",
    },
    {
      key: "partDescription",
      label: "Part Description",
      accessor: "partDescription",
      type: "text",
    },
    {
      key: "partNoDrawingNo",
      label: "Part No / Drawing No",
      accessor: "partNoDrawingNo",
      type: "text",
    },
    {
      key: "quantityReceived",
      label: "Qty Received",
      accessor: "quantityReceived",
      type: "text",
    },
    {
      key: "supplier",
      label: "Supplier",
      accessor: "supplier",
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
    "requestNo",
    "date",
    "to",
    "deviationRequestedBy",
    "customerName",
    "productName",
    "partDescription",
    "partNoDrawingNo",
    "quantityReceived",
    "supplier",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: "Active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "Inactive",
      activeValue: "Active",
    },
  ];

  return (
    <CommonListViewTable
      title="Engineering Deviation Request/Note"
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
      emptyMessage="No Engineering Deviation Requests found"
      loadingMessage="Loading Engineering Deviation Requests..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="EngineeringDeviationRequests"
    />
  );
};

export default EngineeringDeviationRequestList;