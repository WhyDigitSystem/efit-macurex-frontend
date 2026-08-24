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

      const response = await productionBulkIssueAPI.getByOrgId(
        orgId,
        branchId,
      );

      if (response?.status === false) {
        const msg =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          "Failed to load production bulk issues";

        console.warn(msg);

        setItemData([]);

        return;
      }

      const issues = Array.isArray(
        response?.paramObjectsMap?.productionBulkIssueList
      )
        ? response.paramObjectsMap.productionBulkIssueList
        : [];

      if (issues.length === 0) {
        console.warn("No Production Bulk Issues found");

        setItemData([]);

        return;
      }

      const transformedData = issues.map((item) => {
        return {
          ...item,

          id: item.id,

          /*
           * Backend sends:
           * docId: "BLR/PBI/26-27/00001"
           *
           * Frontend table uses:
           * issueNo
           */
          issueNo: item.docId || "",

          docId: item.docId || "",

          issueDate: item.issueDate || item.docDate || "",

          docDate: item.docDate || "",

          plant: item.plant?.plantName || item.plant?.plantId || "",

          plantId: item.plant?.id || "",

          belongsTo: item.belongsTo || "",

          fgItemCode: item.fgItem?.itemCode || "",
          fgItemDescription: item.fgItem?.itemDescription || "",
          fgItemId: item.fgItem?.id || null,

          indentNo: item.indent?.docId || item.indentNo || "",

          issueType: item.issueType || "",

          fromLocation:
            item.fromLocation?.locationName ||
            item.fromLocation?.locationCode ||
            "",
          fromLocationCode: item.fromLocation?.locationCode || "",
          fromLocationId: item.fromLocation?.id || null,

          toLocation:
            item.toLocation?.locationName ||
            item.toLocation?.locationCode ||
            "",
          toLocationCode: item.toLocation?.locationCode || "",
          toLocationId: item.toLocation?.id || null,

          remarks: item.remarks || "",

          active:
            item.active === true ||
            String(item.active).toLowerCase() === "active",

          activeStatus: item.active || "",

          createdBy: item.createdBy || item.preparedBy || "",

          preparedBy: item.preparedBy || "",

          productionBulkIssueDetailsDTO:
            item.productionBulkIssueDetailsResponseDTO || [],
        };
      });

      transformedData.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading production bulk issues:", error);

      setItemData([]);
    } finally {
      setLoading(false);
    }
  }, [productionBulkIssueAPI]);

  useEffect(() => {
    const orgId = localStorage.getItem("orgId");
    const branchId = localStorage.getItem("branchId");

    loadItems(orgId, branchId);
  }, [loadItems]);

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
      key: "issueDate",
      label: "Issue Date",
      accessor: "issueDate",
      type: "date",
    },

    {
      key: "plant",
      label: "Plant",
      accessor: "plant",
      type: "text",
    },

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
    },

    {
      key: "issueType",
      label: "Type",
      accessor: "issueType",
      type: "text",
    },

    {
      key: "fromLocation",
      label: "From Location",
      accessor: "fromLocation",
      type: "text",
    },

    {
      key: "toLocation",
      label: "To Location",
      accessor: "toLocation",
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
    "plant",
    "belongsTo",
    "fgItemCode",
    "fgItemDescription",
    "indentNo",
    "issueType",
    "fromLocation",
    "toLocation",
    "createdBy",
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
      title="Production (Bulk) Issues"
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
      emptyMessage="No Production Bulk Issues found"
      loadingMessage="Loading Production Bulk Issues..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="ProductionBulkIssues"
    />
  );
};

export default ProductionBulkIssueList;
