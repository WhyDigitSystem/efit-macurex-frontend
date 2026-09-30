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

  const normalize = (r) => ({
    ...r,

    docDateText: r.documentDate || "",

    entryForText: r.entryFor?.code || "",

    vendorText: r.vendorId?.customerName || "",

    toLocationText: r.toLocation?.locationName || "",

    statusText:
      r.active === "Inactive" || r.active === false ? "Inactive" : "Active",
  });

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);

      const data = await scrapMaterialReturnAPI.getScrapMaterialReturnByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      const rows = Array.isArray(data) ? data.map(normalize) : [];

      rows.sort((a, b) => (b.id || 0) - (a.id || 0));

      setRecords(rows);
    } catch (error) {
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
      key: "docDate",
      label: "Doc Date",
      accessor: "docDateText",
      type: "text",
    },
    {
      key: "entryFor",
      label: "Entry For",
      accessor: "entryForText",
      type: "text",
    },
    {
      key: "entryType",
      label: "Entry Type",
      accessor: "entryType",
      type: "text",
    },
    {
      key: "vendor",
      label: "Vendor",
      accessor: "vendorText",
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: "toLocationText",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "statusText",
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
    "docDateText",
    "entryForText",
    "entryType",
    "vendorText",
    "toLocationText",
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
      field: "statusText",
      filterValue: "active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "statusText",
      filterValue: "inactive",
      activeValue: "Active",
    },
  ];

  return (
    <CommonListViewTable
      title="Scrap/Material Return/Rejection"
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
