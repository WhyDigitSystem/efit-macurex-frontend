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
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);

      const complaints = await customerComplaintAPI.getComplaintByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      complaints.sort((a, b) => (b.id || 0) - (a.id || 0));

      setComplaintData(complaints);
    } catch (error) {
      console.error("Failed to load customer complaints:", error);
      setComplaintData([]);
      toast.error("Failed to fetch Customer Complaints");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

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
      type: "date",
    },
    {
      key: "branch",
      label: "Plant ID",
      accessor: (row) =>
        typeof row.branch === "object"
          ? row.branch.branchName || row.branch.id
          : row.branch || row.plantId,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) =>
        typeof row.department === "object"
          ? row.department.departmentName || row.department.id
          : row.department,
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: (row) =>
        typeof row.customer === "object"
          ? row.customer.customerName || row.customer.id
          : row.customerName,
      type: "text",
    },
    {
      key: "customerRefNo",
      label: "Customer Ref No",
      accessor: (row) => row.customerRefNo || row.complaintRefNo,
      type: "text",
    },
    {
      key: "complaintType",
      label: "Complaint Type",
      accessor: (row) => row.complaintType,
      type: "text",
    },
    {
      key: "item",
      label: "Item",
      accessor: (row) =>
        typeof row.item === "object"
          ? row.item.itemCode || row.item.id
          : row.item || row.itemCode,
      type: "text",
    },
    {
      key: "status",
      label: "Status",
      accessor: (row) => row.active,
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
    "complaintNo",
    "branch",
    "branch.branchName",
    "plantId",
    "department",
    "department.departmentName",
    "customerName",
    "customer.customerName",
    "customerRefNo",
    "complaintRefNo",
    "complaintType",
    "item",
    "item.itemCode",
    "itemCode",
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
      field: "status",
      filterValue: "active",
      activeValue: true,
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "status",
      filterValue: "inactive",
      activeValue: true,
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
