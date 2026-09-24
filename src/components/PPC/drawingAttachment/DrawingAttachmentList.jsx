import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import drawingAttachmentAPI from "../../../api/PPC/drawingAttachmentAPI";
import { toast } from "../../../utils/toast";

const DrawingAttachmentList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;

  const loadRecords = useCallback(async () => {
    if (!ORG_ID) return;
    try {
      setLoading(true);
      const records = await drawingAttachmentAPI.getByOrgId(ORG_ID);
      records.sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(records);
    } catch (error) {
      console.error("Failed to load drawing attachments:", error);
      setData([]);
      toast.error("Failed to fetch Drawing Attachments");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  /* ---------------- Accessors ---------------- */

  const getTypeOfItemLabel = (row) =>
    row?.typeOfItem?.description ||
    row?.typeOfItem?.code ||
    row?.typeOfItem ||
    "";

  const getFgPartNoLabel = (row) =>
    row?.fgPartNo?.itemCode ||
    row?.fgPartNo?.id ||
    row?.fgPartNo ||
    "";

  const getFgPartDescription = (row) =>
    row?.fgPartDescription ||
    row?.fgPartNo?.itemDescription ||
    "";

  /* ---------------- Columns ---------------- */

  const columns = [
    {
      key: "typeOfItem",
      label: "Type of Item",
      accessor: (row) => getTypeOfItemLabel(row),
      type: "text",
    },
    {
      key: "fgPartNo",
      label: "FG Part No",
      accessor: (row) => getFgPartNoLabel(row),
      type: "text",
    },
    {
      key: "fgPartDescription",
      label: "FG Part Description",
      accessor: (row) => getFgPartDescription(row),
      type: "text",
    },
    {
      key: "attachmentCount",
      label: "Attachments",
      accessor: (row) =>
        (row?.drawingAttachmentDetailResponseDTO || []).length,
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) =>
        row?.active === true || row?.active === "Active"
          ? "Active"
          : "Inactive",
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
    "typeOfItem.description",
    "typeOfItem.code",
    "fgPartNo.itemCode",
    "fgPartDescription",
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
      title="Drawing Attachments"
      data={data}
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
      emptyMessage="No Drawing Attachments found"
      loadingMessage="Loading Drawing Attachments..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="DrawingAttachments"
    />
  );
};

export default DrawingAttachmentList;