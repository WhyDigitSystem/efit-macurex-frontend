import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import eightDisciplineEntryAPI from "../../../api/quality/eightDisciplineEntryAPI";
import { toast } from "../../../utils/toast";

const EightDisciplineEntryList = ({
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
    try {
      setLoading(true);
      const data = await eightDisciplineEntryAPI.getEightDisciplineByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load 8D entries:", error);
      setRecords([]);
      toast.error("Failed to fetch 8-Discipline Entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "gdControlNo",
      label: "GD Control No",
      accessor: (row) => row.gdControlNo || row.controlNo || row.gdNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.date,
      type: "text",
    },
    {
      key: "complaintType",
      label: "Complaint Type",
      accessor: (row) => row.complaintType,
      type: "text",
    },
    {
      key: "complaintNo",
      label: "Complaint No",
      accessor: (row) => row.complaintNo,
      type: "text",
    },
    {
      key: "customerCode",
      label: "Customer Code",
      accessor: (row) =>
        typeof row.customerCode === "object"
          ? row.customerCode.customerCode || row.customerCode.id
          : row.customerCode || row.customerId,
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: (row) => row.customerName,
      type: "text",
    },
    {
      key: "itemCode",
      label: "Item Code",
      accessor: (row) =>
        typeof row.itemCode === "object"
          ? row.itemCode.itemCode || row.itemCode.id
          : row.itemCode,
      type: "text",
    },
    {
      key: "itemDescription",
      label: "Item Description",
      accessor: (row) =>
        typeof row.itemDescription === "object"
          ? row.itemDescription.itemDescription || row.itemDescription.id
          : row.itemDescription,
      type: "text",
    },
    {
      key: "rootCauseNo",
      label: "Root Cause No",
      accessor: (row) => row.rootCauseNo,
      type: "text",
    },
    {
      key: "dateOpened",
      label: "Date Opened",
      accessor: (row) => row.dateOpened,
      type: "text",
    },
    {
      key: "closedDate",
      label: "Closed Date",
      accessor: (row) => row.closedDate,
      type: "text",
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
    "gdControlNo",
    "controlNo",
    "gdNo",
    "date",
    "complaintType",
    "complaintNo",
    "customerCode",
    "customerId",
    "customerName",
    "itemCode",
    "itemCode.itemCode",
    "itemDescription",
    "rootCauseNo",
    "dateOpened",
    "closedDate",
  ];

  return (
    <CommonListViewTable
      title="8-Discipline Entry"
      data={records}
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
      emptyMessage="No 8-Discipline Entries found"
      loadingMessage="Loading 8-Discipline Entries..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="EightDisciplineEntries"
    />
  );
};

export default EightDisciplineEntryList;
