import { useCallback, useEffect, useState } from "react";
import controlPlanAPI from "../../../api/quality/controlPlanAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const ControlPlanList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [planData, setPlanData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);

      const response = await controlPlanAPI.getControlPlans(ORG_ID);

      const sortedPlans = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setPlanData(sortedPlans);
    } catch (error) {
      console.error("Failed to load control plans:", error);
      setPlanData([]);
      toast.error("Failed to fetch Control Plans");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans, refreshTrigger]);

  const handleEdit = (plan) => {
    onEdit(plan);
  };

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
      key: "originDate",
      label: "Origin Date",
      accessor: "originDate",
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
    "planNo",
    "controlPlanType",
    "fgItemCode",
    "itemDescription",
    "processSheetNo",
  ];

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
