import { useCallback, useEffect, useState } from "react";
import controlPlanAPI from "../../../api/quality/controlPlanAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const ControlPlanList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [planData, setPlanData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  // ---------------------------------------------------------------------------
  // Load Control Plans
  // ---------------------------------------------------------------------------
  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);

      console.log("Loading Control Plans...");
      console.log("ORG_ID:", ORG_ID);
      console.log("BRANCH_ID:", BRANCH_ID);

      const response = await controlPlanAPI.getControlPlanByOrgId(
        BRANCH_ID,
        ORG_ID,
      );

      console.log("Control Plan API Response:", response);

      // Always make sure the table receives an array
      const list = Array.isArray(response)
        ? response
        : response
          ? [response]
          : [];

      console.log("Control Plan List:", list);

      // Sort latest ID first
      const sortedPlans = [...list].sort(
        (a, b) => (Number(b?.id) || 0) - (Number(a?.id) || 0),
      );

      console.log("Sorted Control Plans:", sortedPlans);

      setPlanData(sortedPlans);
    } catch (error) {
      console.error("Failed to load control plans:", error);

      setPlanData([]);

      toast.error("Failed to fetch Control Plans");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  // ---------------------------------------------------------------------------
  // Initial Load + Refresh After Create/Update
  // ---------------------------------------------------------------------------
  useEffect(() => {
    loadPlans();
  }, [loadPlans, refreshTrigger]);

  // ---------------------------------------------------------------------------
  // Edit
  // ---------------------------------------------------------------------------
  const handleEdit = (plan) => {
    if (!plan) {
      console.error("Invalid Control Plan selected for edit");
      return;
    }

    onEdit(plan);
  };

  // ---------------------------------------------------------------------------
  // Table Columns
  // ---------------------------------------------------------------------------
  const columns = [
    {
      key: "planNo",
      label: "Plan No",
      accessor: "planNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "controlPlanType",
      label: "Control Plan Type",
      accessor: "controlPlanType",
      type: "text",
    },
    {
      key: "fgItemCode",
      label: "FG Item Code",
      accessor: "fgItemCode",
      type: "text",
    },
    {
      key: "itemDescription",
      label: "Item Description",
      accessor: "itemDescription",
      type: "text",
    },
    {
      key: "processSheetNo",
      label: "Process Sheet No",
      accessor: "processSheetNo",
      type: "text",
    },
    {
      key: "revisionDate",
      label: "Revision Date",
      accessor: "revisionDate",
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

  // ---------------------------------------------------------------------------
  // Search Fields
  // ---------------------------------------------------------------------------
  const searchFields = [
    "planNo",
    "controlPlanType",
    "fgItemCode",
    "itemDescription",
    "processSheetNo",
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <CommonListViewTable
      title="Control Plan"
      subtitle="Quality - Manage control plans for items and process sheets"
      data={planData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      itemsPerPageOptions={[5, 10, 25, 50, 100]}
      defaultItemsPerPage={10}
      showSerialNumber={true}
      emptyMessage="No Control Plans found"
      loadingMessage="Loading Control Plans..."
      enableRefresh={true}
      onRefresh={loadPlans}
      enableExport={true}
      exportFileName="ControlPlans"
    />
  );
};

export default ControlPlanList;
