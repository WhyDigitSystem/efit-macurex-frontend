import { useCallback, useEffect, useState } from "react";
import purchaseIndentAPI from "../../../api/Purchase/purchaseIndentAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const PurchaseIndentList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [indentData, setIndentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadIndents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await purchaseIndentAPI.getPurchaseIndentByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setIndentData(sortedData);
    } catch (error) {
      console.error("Failed to load purchase indents:", error);
      setIndentData([]);
      toast.error("Failed to fetch purchase indents");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadIndents();
  }, [loadIndents, refreshTrigger]);

  const columns = [
    {
      key: "indentNo",
      label: "Indent No",
      accessor: (row) => row.header?.indentNo,
      type: "text",
    },
    {
      key: "indentDate",
      label: "Indent Date",
      accessor: (row) => row.header?.indentDate,
      type: "date",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.header?.department,
      type: "text",
    },
    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: (row) => row.header?.preparedBy,
      type: "text",
    },
    {
      key: "plant",
      label: "Plant",
      accessor: (row) => row.header?.plant,
      type: "text",
    },
    {
      key: "approved",
      label: "Approved",
      accessor: (row) => row.header?.approved,
      type: "badge",
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
    "header.indentNo",
    "header.department",
    "header.preparedBy",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Purchase Indent"
        data={indentData}
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
        emptyMessage="No Purchase Indents found"
        loadingMessage="Loading Purchase Indents..."
        enableRefresh={true}
        onRefresh={loadIndents}
        enableExport={true}
        exportFileName="PurchaseIndents"
      />
    </div>
  );
};

export default PurchaseIndentList;
