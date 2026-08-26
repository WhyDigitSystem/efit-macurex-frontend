import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { purchaseDeliveryScheduleAPI } from "../../../api/Purchase/purchaseDeliveryScheduleAPI";
import { toast } from "../../../utils/toast";

const PurchaseDeliveryScheduleList = ({
  onAddNew,
  onEdit,
  refreshTrigger,
  onBack,
}) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadSchedules = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      console.error("OrgId or BranchId not found in localStorage");
      return;
    }

    try {
      setLoading(true);

      const response = await purchaseDeliveryScheduleAPI.getScheduleByOrgId(
        BRANCH_ID,
        ORG_ID
      );

      console.log("API Response:", response);

      // Extract the purchaseDeliveryScheduleVO array from the response
      let schedules = [];

      if (response?.status && response?.paramObjectsMap?.purchaseDeliveryScheduleVO) {
        schedules = response.paramObjectsMap.purchaseDeliveryScheduleVO;
      } else if (Array.isArray(response)) {
        schedules = response;
      } else if (response?.purchaseDeliveryScheduleVO) {
        schedules = response.purchaseDeliveryScheduleVO;
      }

      // Transform the data for the table
      const transformedData = schedules.map((item) => ({
        id: item.id,
        docNo: item.docId || "",
        docDate: item.docDate || "",
        plantId: item.branch?.branchName || item.branch?.id || "",
        belongsTo: item.belongsTo || "",
        supplierCode: item.supplier?.supplierCode || "",
        supplierName: item.supplier?.supplierName || "",
        poNo: item.purchaseOrderNo || "",
        schStartDate: item.scheduleStartDate || "",
        schEndDate: item.scheduleEndDate || "",
        active: item.active || "Inactive",
        scheduleDetails: item.scheduleDetails || [],
        orgId: item.orgId,
        branch: item.branch,
        supplier: item.supplier,
        financialYear: item.financialYear,
        cancelRemarks: item.cancelRemarks,
        createdBy: item.createdBy,
      }));

      // Sort by id descending (newest first)
      transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));

      setScheduleData(transformedData);
    } catch (error) {
      console.error("Failed to load purchase delivery schedules:", error);
      setScheduleData([]);
      toast.error("Failed to fetch Purchase Delivery Schedules");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules, refreshTrigger]);

  const columns = [
    {
      key: "docNo",
      label: "Doc No",
      accessor: "docNo",
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant ID",
      accessor: "plantId",
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },
    {
      key: "supplierCode",
      label: "Supplier Code",
      accessor: "supplierCode",
      type: "text",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: "supplierName",
      type: "text",
    },
    {
      key: "poNo",
      label: "PO No.",
      accessor: "poNo",
      type: "text",
    },
    {
      key: "schStartDate",
      label: "Sch. Start Date",
      accessor: "schStartDate",
      type: "text",
    },
    {
      key: "schEndDate",
      label: "Sch. End Date",
      accessor: "schEndDate",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
      statusVariants: {
        Active: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        Inactive: {
          label: "Inactive",
          className:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        },
      },
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
    "docNo",
    "plantId",
    "belongsTo",
    "supplierCode",
    "supplierName",
    "poNo",
  ];

  const filterOptions = [
    {
      value: "all",
      label: "All",
      field: null,
    },
    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: "active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "inactive",
      activeValue: "Active",
    },
  ];

  return (
    <CommonListViewTable
      title="Purchase Delivery Schedule"
      data={scheduleData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Purchase Delivery Schedules found"
      loadingMessage="Loading Purchase Delivery Schedules..."
      enableRefresh={true}
      onRefresh={loadSchedules}
      enableExport={true}
      exportFileName="PurchaseDeliverySchedules"
    />
  );
};

export default PurchaseDeliveryScheduleList;