import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
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

      const response = await controlPlanAPI.getControlPlanByOrgId(
        BRANCH_ID,
        ORG_ID,
      );

      console.log("Control Plan API Response:", response);

      // Extract from nested paramObjectsMap.controlPlanResponseVO
      let list = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (
        Array.isArray(response?.paramObjectsMap?.controlPlanResponseVO)
      ) {
        list = response.paramObjectsMap.controlPlanResponseVO;
      } else if (response?.paramObjectsMap?.controlPlanResponseVO) {
        list = [response.paramObjectsMap.controlPlanResponseVO];
      } else if (response?.paramObjectsMap?.controlPlanVO) {
        const vo = response.paramObjectsMap.controlPlanVO;
        list = Array.isArray(vo) ? vo : [vo];
      } else if (response) {
        list = [response];
      }

      // Sort latest ID first
      const sortedPlans = [...list].sort(
        (a, b) => (Number(b?.id) || 0) - (Number(a?.id) || 0),
      );

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
  // Table Columns (accessor functions to handle nested objects)
  // ---------------------------------------------------------------------------
  const columns = [
    {
      key: "planNo",
      label: "Plan No",
      accessor: (row) => row.planNo || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "controlPlanType",
      label: "Control Plan Type",
      accessor: (row) =>
        row.controlPlanType?.description ||
        row.controlPlanType?.code ||
        row.controlPlanType ||
        "",
      type: "text",
    },
    {
      key: "fgItemCode",
      label: "FG Item Code",
      accessor: (row) =>
        row.fgItemCode?.itemCode ||
        row.fgItemCode?.itemDescription ||
        row.fgItemCode ||
        "",
      type: "text",
    },
    {
      key: "itemDescription",
      label: "Item Description",
      accessor: (row) => row.itemDescription || "",
      type: "text",
    },
    {
      key: "processSheetNo",
      label: "Process Sheet No",
      accessor: (row) => row.processSheetNo || "",
      type: "text",
    },
    {
      key: "revisionDate",
      label: "Revision Date",
      accessor: (row) =>
        row.revisionDate ? dayjs(row.revisionDate).format("YYYY-MM-DD") : "",
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
  const searchFields = ["planNo", "itemDescription", "processSheetNo"];

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