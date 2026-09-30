import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import machineToolBreakdownAPI from "../../../api/plantMaintenance/machineToolBreakdownAPI";
import { useToast } from "../../Toast/ToastContext";

const BreakdownAuthorizationList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [authData, setAuthData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  const loadBreakdownAuthorizations = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      setAuthData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const list =
        await machineToolBreakdownAPI.getAuthorizationForBreakdownByOrgId(
          BRANCH_ID,
          ORG_ID
        );

      const sorted = (list || []).sort(
        (a, b) => Number(b.id || 0) - Number(a.id || 0)
      );

      setAuthData(sorted);
    } catch (error) {
      console.error("Failed to load breakdown authorizations:", error);
      addToast("Failed to fetch breakdown authorizations", "error");
      setAuthData([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  useEffect(() => {
    loadBreakdownAuthorizations();
  }, [loadBreakdownAuthorizations, refreshTrigger]);

  // Map API fields to table columns
  const columns = [
    {
      key: "docNo",
      label: "DocNo",
      accessor: (row) => row.docId,
      type: "text",
    },
    {
      key: "docDate",
      label: "DocDate",
      accessor: (row) => row.rectificationDate || "-",
      type: "text",
    },
    {
      key: "plant",
      label: "Plant Id",
      accessor: (row) => row.branch?.branchName || row.branch?.branchCode || "-",
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) =>
        row.department?.departmentName ||
        row.department?.departmentCode ||
        "-",
      type: "text",
    },
    {
      key: "breakdownNo",
      label: "BreakdownNo",
      accessor: (row) => row.breakdownNo || "-",
      type: "text",
    },
    {
      key: "machineNo",
      label: "Machine No.",
      accessor: (row) => row.machineNo || "-",
      type: "text",
    },
    {
      key: "working",
      label: "Working",
      accessor: (row) => row.working || "-",
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

  const searchFields = ["breakdownNo", "machineNo", "rectificationNo"];

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