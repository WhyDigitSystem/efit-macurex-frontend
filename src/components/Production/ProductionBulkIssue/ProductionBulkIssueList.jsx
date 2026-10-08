import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import productionBulkIssueAPI from "../../../api/Production/productionBulkIssueAPI";

const ProductionBulkIssueList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async (orgId, branchId) => {
    setLoading(true);

    try {
      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");
        setItemData([]);
        return;
      }

      const response = await productionBulkIssueAPI.getByOrgId(orgId, branchId);

      if (response?.status === false) {
        console.warn(
          response?.paramObjectsMap?.errorMessage ||
            response?.paramObjectsMap?.message ||
            "Failed to load production bulk issues",
        );
        setItemData([]);
        return;
      }

      const issues = Array.isArray(
        response?.paramObjectsMap?.productionBulkIssues,
      )
        ? response.paramObjectsMap.productionBulkIssues
        : [];

      if (issues.length === 0) {
        setItemData([]);
        return;
      }

      const transformedData = issues.map((item) => ({
        id: item.id,

        /* Backend may return docId = null; show a temporary PBI-<id>.
           The form strips this placeholder before saving. */
        issueNo:
          item.docId !== null && item.docId !== undefined
            ? item.docId
            : item.id
              ? `PBI-${item.id}`
              : "",
        docId: item.docId || "",

        /* Raw backend values — the form reads these when editing. */
        date: item.date || "",
        docDate: item.docDate || "",
        issueDate: item.issueDate || "",

        /* Column display only */
        displayDate: item.docDate || item.date || "",

        plant: item.branch?.branchName || item.branch?.branchCode || "",
        plantCode: item.branch?.branchCode || "",
        plantId: item.branch?.id || null,
        branch: item.branch || null,

        belongsTo: item.belongsTo || "",

        fgItemCode: item.fgItem?.itemCode || "",
        fgItemDescription: item.fgItem?.itemDescription || "",
        fgItemId: item.fgItem?.id || null,
        fgItemUnit: item.fgItem?.unit || "",
        fgItem: item.fgItem || null,

        indentNo: item.indentNo || "",
        purchaseMaterialRef: item.purchaseMaterialRef || "",

        /* Backend names are refNo / type */
        refNo: item.refNo || "",
        referenceNo: item.refNo || "",
        type: item.type || "",
        issueType: item.type || "",

        /* Display names are separate from the objects the form reads */
        fromLocationName:
          item.fromLocation?.locationName ||
          item.fromLocation?.locationCode ||
          "",
        fromLocationCode: item.fromLocation?.locationCode || "",
        fromLocationId: item.fromLocation?.id || null,
        fromLocation: item.fromLocation || null,

        toLocationName:
          item.toLocation?.locationName || item.toLocation?.locationCode || "",
        toLocationCode: item.toLocation?.locationCode || "",
        toLocationId: item.toLocation?.id || null,
        toLocation: item.toLocation || null,

        remarks: item.remarks || "",

        createdBy: item.createdBy || "",
        updatedBy: item.updatedBy || "",

        active:
          item.active === true ||
          String(item.active).toLowerCase() === "active",
        activeStatus: item.active,

        cancel:
          item.cancel === true || String(item.cancel).toUpperCase() === "T",
        cancelRemarks: item.cancelRemarks || "",

        screenName: item.screenName || "",
        screenCode: item.screenCode || "",

        orgId: item.orgId || null,
        financialYear: item.financialYear || "",

        details: Array.isArray(item.details) ? item.details : [],
        productionBulkIssueDetailsResponseDTO: Array.isArray(
          item.productionBulkIssueDetailsResponseDTO,
        )
          ? item.productionBulkIssueDetailsResponseDTO
          : [],
      }));

      transformedData.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading production bulk issues:", error);
      setItemData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* Initial load + refresh button (which calls with no arguments) */
  const handleRefresh = useCallback(
    () =>
      loadItems(
        localStorage.getItem("orgId"),
        localStorage.getItem("branchId"),
      ),
    [loadItems],
  );

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleEdit = (item) => {
    onEdit(item);
  };

  const columns = [
    {
      key: "issueNo",
      label: "Issue No",
      accessor: "issueNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "displayDate",
      label: "Date",
      accessor: "displayDate",
      type: "date",
    },
    { key: "plant", label: "Plant", accessor: "plant", type: "text" },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },
    {
      key: "fgItemCode",
      label: "FG Item Code",
      accessor: "fgItemCode",
      type: "text",
    },
    {
      key: "fgItemDescription",
      label: "FG Item Description",
      accessor: "fgItemDescription",
      type: "text",
    },
    {
      key: "indentNo",
      label: "Indent No",
      accessor: "indentNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "purchaseMaterialRef",
      label: "Purchase Material Ref",
      accessor: "purchaseMaterialRef",
      type: "text",
    },
    {
      key: "fromLocationName",
      label: "From Location",
      accessor: "fromLocationName",
      type: "text",
    },
    {
      key: "toLocationName",
      label: "To Location",
      accessor: "toLocationName",
      type: "text",
    },
    {
      key: "createdBy",
      label: "Created By",
      accessor: "createdBy",
      type: "text",
    },

    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
      statusVariants: {
        true: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        false: {
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
    "issueNo",
    "displayDate",
    "plant",
    "belongsTo",
    "fgItemCode",
    "fgItemDescription",
    "indentNo",
    "purchaseMaterialRef",
    "fromLocationName",
    "toLocationName",
    "createdBy",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: true,
      activeValue: true,
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: false,
      activeValue: false,
    },
  ];

  return (
    <CommonListViewTable
      title="Production (Bulk) Issue"
      data={itemData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Production (Bulk) Issues found"
      loadingMessage="Loading Production (Bulk) Issues..."
      enableRefresh={true}
      onRefresh={handleRefresh}
      enableExport={true}
      exportFileName="ProductionBulkIssues"
    />
  );
};

export default ProductionBulkIssueList;
