import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const BreakdownAuthorizationList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [authData, setAuthData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadBreakdownAuthorizations = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await breakdownAuthorizationAPI.getBreakdownAuthorizationByOrgId(
          ORG_ID,
        );

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setAuthData(sortedData);
    } catch (error) {
      console.error("Failed to load breakdown authorizations:", error);
      setAuthData([]);
      toast.error("Failed to fetch breakdown authorizations");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadBreakdownAuthorizations();
  }, [loadBreakdownAuthorizations, refreshTrigger]);

  const columns = [
    {
      key: "docNo",
      label: "DocNo",
      accessor: (row) => row.header?.docNo,
      type: "text",
    },
    {
      key: "docDate",
      label: "DocDate",
      accessor: (row) => row.header?.docDate,
      type: "date",
    },
    {
      key: "plant",
      label: "Plant Id",
      accessor: (row) => row.header?.plant,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.header?.department,
      type: "text",
    },
    {
      key: "breakdownNo",
      label: "BreakdownNo",
      accessor: (row) => row.header?.breakdownNo,
      type: "text",
    },
    {
      key: "machineNo",
      label: "Machine No.",
      accessor: (row) => row.header?.machineNo,
      type: "text",
    },
    {
      key: "working",
      label: "Working",
      accessor: (row) => row.header?.working,
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
    "header.docNo",
    "header.breakdownNo",
    "header.machineNo",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Authorization For Breakdown"
        data={authData}
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
        emptyMessage="No Breakdown Authorizations found"
        loadingMessage="Loading Breakdown Authorizations..."
        enableRefresh={true}
        onRefresh={loadBreakdownAuthorizations}
        enableExport={true}
        exportFileName="BreakdownAuthorizations"
      />
    </div>
  );
};

export default BreakdownAuthorizationList;
