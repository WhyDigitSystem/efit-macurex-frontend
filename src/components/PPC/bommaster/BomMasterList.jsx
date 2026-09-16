import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import bomMasterAPI from "../../../api/PPC/bomMasterAPI";
import { toast } from "../../../utils/toast";

const BomMasterList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [bomData, setBomData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadBoms = useCallback(async () => {
    try {
      setLoading(true);

      const boms = await bomMasterAPI.getBillOfMaterialByOrgId(
        BRANCH_ID,
        ORG_ID,
      );

      const recordsArray = Array.isArray(boms) ? boms : [];
      recordsArray.sort((a, b) => (b.id || 0) - (a.id || 0));

      setBomData(recordsArray);
    } catch (error) {
      console.error("Failed to load BOM master records:", error);
      setBomData([]);
      toast.error("Failed to fetch BOM master records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadBoms();
  }, [loadBoms, refreshTrigger]);

  const columns = [
    {
      key: "docId",
      label: "Doc No",
      accessor: "docId",
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
      type: "date",
    },
    {
      key: "fgItemCode",
      label: "FG/SFG Item Code",
      accessor: (row) => row.fgItem?.itemCode || "",
      type: "text",
    },
    {
      key: "fgItemDescription",
      label: "FG/SFG Item Description",
      accessor: (row) => row.fgItem?.itemDescription || "",
      type: "text",
    },
    {
      key: "typeOfBom",
      label: "Type of BOM",
      accessor: (row) =>
        row.typeOfBom?.listDescription || row.typeOfBom?.listCode || "",
      type: "text",
    },
    {
      key: "typeOfItem",
      label: "Type of Item",
      accessor: "typeOfItem",
      type: "text",
    },
    {
      key: "revisionNo",
      label: "Revision",
      accessor: "revisionNo",
      type: "text",
    },
    {
      key: "materials",
      label: "Materials",
      accessor: (row) => row.billOfMaterialDetailsResponseDTO?.length || 0,
      type: "text",
    },
    {
      key: "wef",
      label: "WEF",
      accessor: "wef",
      type: "date",
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
    "docId",
    "typeOfItem",
    "revisionNo",
    "wef",
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
      title="Bill of Material"
      data={bomData}
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
      emptyMessage="No BOM master records found"
      loadingMessage="Loading BOM master records..."
      enableRefresh={true}
      onRefresh={loadBoms}
      enableExport={true}
      exportFileName="BomMaster"
    />
  );
};

export default BomMasterList;