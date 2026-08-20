import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const FGTransferSlipList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [transferData, setTransferData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadTransferSlips = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fgTransferSlipAPI.getFGTransferSlipByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setTransferData(sortedData);
    } catch (error) {
      console.error("Failed to load FG transfer slips:", error);
      setTransferData([]);
      toast.error("Failed to fetch FG transfer slips");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadTransferSlips();
  }, [loadTransferSlips, refreshTrigger]);

  const columns = [
    {
      key: "transferNo",
      label: "Transfer No",
      accessor: (row) => row.header?.transferNo,
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.header?.date,
      type: "date",
    },
    {
      key: "plant",
      label: "Plant ID",
      accessor: (row) => row.header?.plant,
      type: "text",
    },
    {
      key: "fromLocation",
      label: "From Location",
      accessor: (row) => row.header?.fromLocation,
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: (row) => row.header?.toLocation,
      type: "text",
    },
    {
      key: "fgItemCode",
      label: "FG Item Code",
      accessor: (row) => row.header?.fgItemCode,
      type: "text",
    },
    {
      key: "scheduledQty",
      label: "Scheduled Qty",
      accessor: (row) => row.header?.scheduledQty,
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
    "header.transferNo",
    "header.fgItemCode",
    "header.itemDesc",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="FG Transfer Slip"
        data={transferData}
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
        emptyMessage="No FG Transfer Slips found"
        loadingMessage="Loading FG Transfer Slips..."
        enableRefresh={true}
        onRefresh={loadTransferSlips}
        enableExport={true}
        exportFileName="FGTransferSlips"
      />
    </div>
  );
};

export default FGTransferSlipList;
