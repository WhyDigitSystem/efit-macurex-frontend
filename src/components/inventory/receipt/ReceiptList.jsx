import { useCallback, useEffect, useState } from "react";
import receiptAPI from "../../../api/Inventory/receiptAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const ReceiptList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [receiptData, setReceiptData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadReceipts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await receiptAPI.getReceiptByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setReceiptData(sortedData);
    } catch (error) {
      console.error("Failed to load receipts:", error);
      setReceiptData([]);
      toast.error("Failed to fetch receipts");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts, refreshTrigger]);

  const columns = [
    {
      key: "recNo",
      label: "Rec No",
      accessor: (row) => row.header?.recNo,
      type: "text",
    },
    {
      key: "recDate",
      label: "Rec. Date",
      accessor: (row) => row.header?.recDate,
      type: "date",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.header?.department,
      type: "text",
    },
    {
      key: "issueNo",
      label: "Issue No",
      accessor: (row) => row.header?.issueNo,
      type: "text",
    },
    {
      key: "receivedFrom",
      label: "Received From",
      accessor: (row) => row.header?.receivedFrom,
      type: "text",
    },
    {
      key: "locationTo",
      label: "Location To",
      accessor: (row) => row.header?.locationTo,
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant ID",
      accessor: (row) => row.header?.plantId,
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

  const searchFields = [
    "header.recNo",
    "header.department",
    "header.receivedFrom",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Receipts"
        data={receiptData}
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
        emptyMessage="No Receipts found"
        loadingMessage="Loading Receipts..."
        enableRefresh={true}
        onRefresh={loadReceipts}
        enableExport={true}
        exportFileName="Receipts"
      />
    </div>
  );
};

export default ReceiptList;
