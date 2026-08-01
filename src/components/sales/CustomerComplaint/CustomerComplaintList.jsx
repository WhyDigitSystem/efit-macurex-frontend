import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { customerComplaintAPI } from "../../../api/Sales/customerComplaintAPI";
import { toast } from "../../../utils/toast";

const CustomerComplaintList = ({
  onAddNew,
  onEdit,
  refreshTrigger,
  onBack,
}) => {
  const [complaintData, setComplaintData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);

      const complaints = await customerComplaintAPI.getComplaintByOrgId(ORG_ID);

      complaints.sort((a, b) => (b.id || 0) - (a.id || 0));

      setComplaintData(complaints);
    } catch (error) {
      console.error("Failed to load customer complaints:", error);
      setComplaintData([]);
      toast.error("Failed to fetch Customer Complaints");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints, refreshTrigger]);

  const columns = [
    {
      key: "complaintNo",
      label: "Complaint No",
      accessor: "complaintNo",
      type: "text",
    },
    {
      key: "complaintDate",
      label: "Complaint Date",
      accessor: "complaintDate",
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant ID",
      accessor: "plantId",
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: "customerName",
      type: "text",
    },
    {
      key: "customerPartNo",
      label: "Customer Part No",
      accessor: "customerPartNo",
      type: "text",
    },
    {
      key: "complaintType",
      label: "Complaint Type",
      accessor: "complaintType",
      type: "text",
    },
    {
      key: "itemCode",
      label: "Item Code",
      accessor: "itemCode",
      type: "text",
    },
    {
      key: "status",
      label: "Status",
      accessor: "status",
      type: "status",
      statusVariants: {
        Draft: {
          label: "Draft",
          className:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
        },
        Submitted: {
          label: "Submitted",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
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
    "complaintNo",
    "plantId",
    "department",
    "customerName",
    "customerPartNo",
    "complaintType",
    "itemCode",
  ];

  const filterOptions = [
    {
      value: "all",
      label: "All",
      field: null,
    },
    {
      value: "draft",
      label: "Draft",
      field: "status",
      filterValue: "draft",
      activeValue: "Draft",
    },
    {
      value: "submitted",
      label: "Submitted",
      field: "status",
      filterValue: "submitted",
      activeValue: "Submitted",
    },
  ];

  return (
    <CommonListViewTable
      title="Customer Complaint Entry"
      data={complaintData}
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
      emptyMessage="No Customer Complaints found"
      loadingMessage="Loading Customer Complaints..."
      enableRefresh={true}
      onRefresh={loadComplaints}
      enableExport={true}
      exportFileName="CustomerComplaints"
    />
  );
};

export default CustomerComplaintList;
