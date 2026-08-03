import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import scrapMaterialReturnAPI from "../../../api/scrapMaterialReturnAPI";
import { toast } from "../../../utils/toast";

const ScrapMaterialReturnList = ({
  onAddNew,
  onEdit,
  refreshTrigger,
  onBack,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data =
        await scrapMaterialReturnAPI.getScrapMaterialReturnByOrgId(
          ORG_ID,
          BRANCH_ID,
        );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load scrap/material return records:", error);
      setRecords([]);
      toast.error("Failed to fetch Scrap/Material Return records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "docNo",
      label: "Doc No",
      accessor: "docNo",
      type: "text",
    },
    {
      key: "docId",
      label: "Doc Id",
      accessor: "docId",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
    },
    {
      key: "entryFor",
      label: "Entry For",
      accessor: "entryFor",
      type: "text",
    },
    {
      key: "entryType",
      label: "Entry Type",
      accessor: "entryType",
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: "plantId",
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
      key: "toLocation",
      label: "To Location",
      accessor: "toLocation",
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
    "docId",
    "entryFor",
    "entryType",
    "plantId",
    "vendorId",
    "vendorName",
    "toLocation",
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
      title="Scrap/Material Return/Rejection From S.C."
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
      emptyMessage="No Scrap/Material Return records found"
      loadingMessage="Loading Scrap/Material Return records..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="ScrapMaterialReturns"
    />
  );
};

export default ScrapMaterialReturnList;
