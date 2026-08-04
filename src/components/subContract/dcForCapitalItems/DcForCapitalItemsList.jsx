import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import dcForCapitalItemsAPI from "../../../api/dcForCapitalItemsAPI";
import { toast } from "../../../utils/toast";

const DcForCapitalItemsList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data =
        await dcForCapitalItemsAPI.getDcForCapitalItemsByOrgId(
          ORG_ID,
          BRANCH_ID,
        );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load DC for capital items:", error);
      setRecords([]);
      toast.error("Failed to fetch DC For Capital Items");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "dcCiNo",
      label: "DC CI No",
      accessor: "dcCiNo",
      type: "text",
    },
    {
      key: "scDcDate",
      label: "SC DC Date",
      accessor: "scDcDate",
      type: "text",
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: "plantName",
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },
    {
      key: "vendorId",
      label: "Vendor Id",
      accessor: "vendorId",
      type: "text",
    },
    {
      key: "vendorName",
      label: "Vendor Name",
      accessor: "vendorName",
      type: "text",
    },
    {
      key: "partyLocation",
      label: "Party Location",
      accessor: "partyLocation",
      type: "text",
    },
    {
      key: "indentNo",
      label: "Indent No",
      accessor: "indentNo",
      type: "text",
    },
    {
      key: "dcType",
      label: "D.C Type",
      accessor: "dcType",
      type: "text",
    },
    {
      key: "approvalByStores",
      label: "Stores Approval",
      accessor: "approvalByStores",
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
    "dcCiNo",
    "scDcDate",
    "plantName",
    "belongsTo",
    "department",
    "vendorId",
    "vendorName",
    "partyLocation",
    "indentNo",
    "dcType",
    "approvalByStores",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
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
      title="DC For Capital Items"
      data={records}
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
      emptyMessage="No DC For Capital Items found"
      loadingMessage="Loading DC For Capital Items..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="DcForCapitalItems"
    />
  );
};

export default DcForCapitalItemsList;