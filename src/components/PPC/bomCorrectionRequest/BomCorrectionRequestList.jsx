import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import bomCorrectionRequestAPI from "../../../api/PPC/bomCorrectionRequestAPI";
import { toast } from "../../../utils/toast";

const BomCorrectionRequestList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);

      const records = await bomCorrectionRequestAPI.getByOrgId(ORG_ID);

      records.sort((a, b) => (b.id || 0) - (a.id || 0));

      setData(records);
    } catch (error) {
      console.error("Failed to load BOM correction requests:", error);
      setData([]);
      toast.error("Failed to fetch BOM Correction Requests");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "fgPartNo",
      label: "FG Part No",
      accessor: (row) => row.header?.fgPartNo || row.fgPartNo,
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.header?.date || row.date,
      type: "text",
    },
    {
      key: "correctionRequestedBy",
      label: "Requested By",
      accessor: (row) =>
        row.header?.correctionRequestedBy || row.correctionRequestedBy,
      type: "text",
    },
    {
      key: "reasonForChange",
      label: "Reason for Change",
      accessor: (row) => row.header?.reasonForChange || row.reasonForChange,
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
    "header.fgPartNo",
    "fgPartNo",
    "header.correctionRequestedBy",
    "correctionRequestedBy",
    "header.date",
    "date",
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
      title="BOM Correction Request/Note"
      data={data}
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
      emptyMessage="No BOM Correction Requests found"
      loadingMessage="Loading BOM Correction Requests..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="BomCorrectionRequests"
    />
  );
};

export default BomCorrectionRequestList;