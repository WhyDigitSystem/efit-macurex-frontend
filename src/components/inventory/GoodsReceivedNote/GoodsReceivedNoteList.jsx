import { useCallback, useEffect, useState } from "react";
import goodsReceivedNoteAPI from "../../../api/Inventory/goodsReceivedNoteAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const GoodsReceivedNoteList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [grnData, setGrnData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadGrns = useCallback(async () => {
    try {
      setLoading(true);

      const response = await goodsReceivedNoteAPI.getGrnByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setGrnData(sortedData);
    } catch (error) {
      console.error("Failed to load GRNs:", error);
      setGrnData([]);
      toast.error("Failed to fetch GRNs");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadGrns();
  }, [loadGrns, refreshTrigger]);

  const columns = [
    {
      key: "grnNo",
      label: "GRN No",
      accessor: (row) => row.header?.grnNo,
      type: "text",
    },
    {
      key: "grnDate",
      label: "GRN Date",
      accessor: (row) => row.header?.grnDate,
      type: "date",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: (row) => row.header?.supplierName,
      type: "text",
    },
    {
      key: "supplierCode",
      label: "Supplier Code",
      accessor: (row) => row.header?.supplierCode,
      type: "text",
    },
    {
      key: "poNo",
      label: "PO No/ PC No",
      accessor: (row) => row.header?.poNo,
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
    "header.grnNo",
    "header.supplierName",
    "header.supplierCode",
    "header.poNo",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Goods Received Note"
        data={grnData}
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
        emptyMessage="No Goods Received Notes found"
        loadingMessage="Loading Goods Received Notes..."
        enableRefresh={true}
        onRefresh={loadGrns}
        enableExport={true}
        exportFileName="GoodsReceivedNotes"
      />
    </div>
  );
};

export default GoodsReceivedNoteList;
