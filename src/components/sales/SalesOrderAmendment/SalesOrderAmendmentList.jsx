import { useState, useEffect, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import salesOrderAmendmentAPI from "../../../api/Sales/salesOrderAmendmentAPI";

const SalesOrderAmendmentList = ({ onAdd, onEdit, onView }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const list = await salesOrderAmendmentAPI.getAll(orgId, branch);

      // Transform the data to match the table format
      const transformedData = list.map((item) => ({
        id: item.id,
        soAmndNo: item.docId || `SOA-${item.id}`,
        date: item.docDate || item.salesOrderDate || "",
        soNo: item.salesOrderNumber || "",
        partyPOAmdNo: item.partyPoAmendmentNo || "",
        revisionNo: item.revisionNo || "",
        poNo: item.poNo || "",
        poDate: item.poDate || "",
        salesOrderDate: item.salesOrderDate || "",
        partyPOAmdDate: item.partyPoAmendmentDate || "",
        remarks: item.remarks || "",
        active: item.active !== false,
        branchName: item.branchName || "",
        createdBy: item.createdBy || "",
        details: item.salesOrderAmendmentDetails || [],
        rawData: item, // Keep raw data for edit
      }));

      // Sort by id in descending order (newest first)
      transformedData.sort((a, b) => b.id - a.id);

      setData(transformedData);
    } catch (error) {
      console.error("Failed to load SO amendments:", error);
    } finally {
      setLoading(false);
    }
  }, [orgId, branch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (row) => {
    // Pass the raw data for editing
    onEdit(row.rawData || row);
  };

  const columns = [
    {
      key: "sno",
      label: "#",
      type: "text",
      width: "50px",
    },
    {
      key: "soAmndNo",
      label: "S.O.Amnd No",
      type: "text",
      accessor: (row) => row.soAmndNo || "",
      noWrap: true,
    },
    {
      key: "date",
      label: "Date",
      type: "text",
      accessor: (row) => row.date || "",
    },
    {
      key: "soNo",
      label: "S.O.No",
      type: "text",
      accessor: (row) => row.soNo || "",
      noWrap: true,
    },
    {
      key: "partyPOAmdNo",
      label: "Party P.O.Amnd No",
      type: "text",
      accessor: (row) => row.partyPOAmdNo || "",
    },
    {
      key: "revisionNo",
      label: "Revision",
      type: "text",
      accessor: (row) => row.revisionNo || "",
      align: "center",
    },
    {
      key: "branchName",
      label: "Branch",
      type: "text",
      accessor: (row) => row.branchName || "",
    },
    {
      key: "createdBy",
      label: "Created By",
      type: "text",
      accessor: (row) => row.createdBy || "",
    },
    {
      key: "status",
      label: "Status",
      type: "status",
      accessor: (row) => (row.active ? "Active" : "Inactive"),
      statusVariants: {
        Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        Inactive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      },
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      onEdit: (row) => handleEdit(row),
      onView: onView,
    },
  ];

  const searchFields = [
    "soAmndNo",
    "soNo",
    "partyPOAmdNo",
    "branchName",
    "createdBy",
    "poNo"
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
      title="Sales Order Amendment"
      subtitle="Manage sales order amendments and revisions"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onAddNew={onAdd}
      onEdit={handleEdit}
      onView={onView}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No SO amendments found"
      loadingMessage="Loading SO amendments..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="SalesOrderAmendment"
    />
  );
};

export default SalesOrderAmendmentList;