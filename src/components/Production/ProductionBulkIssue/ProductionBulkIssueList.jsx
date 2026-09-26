import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import productionBulkIssueAPI from "../../../api/Production/productionBulkIssueAPI";

const ProductionBulkIssueList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* Load Production (Bulk) Issues                                              */
  /* -------------------------------------------------------------------------- */

  const loadItems = useCallback(async (orgId, branchId) => {
    setLoading(true);

    try {
      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");
        setItemData([]);
        return;
      }

      const response = await productionBulkIssueAPI.getByOrgId(orgId, branchId);

      console.log("Production Bulk Issues API Response:", response);

      /* ---------------------------------------------------------------------- */
      /* API Error Check                                                        */
      /* ---------------------------------------------------------------------- */

      if (response?.status === false) {
        const msg =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          "Failed to load production bulk issues";

        console.warn(msg);
        setItemData([]);
        return;
      }

      /* ---------------------------------------------------------------------- */
      /* Get Production Bulk Issues                                             */
      /* ---------------------------------------------------------------------- */

      const issues = Array.isArray(
        response?.paramObjectsMap?.productionBulkIssues,
      )
        ? response.paramObjectsMap.productionBulkIssues
        : [];

      console.log("Production Bulk Issues:", issues);

      if (issues.length === 0) {
        setItemData([]);
        return;
      }

      /* ---------------------------------------------------------------------- */
      /* Transform API Response                                                 */
      /* ---------------------------------------------------------------------- */

      const transformedData = issues.map((item) => {
        return {
          /* ------------------------------------------------------------------ */
          /* Main ID                                                            */
          /* ------------------------------------------------------------------ */

          id: item.id,

          /* ------------------------------------------------------------------ */
          /* Issue / Document Number                                            */
          /* ------------------------------------------------------------------ */

          /*
           * Backend currently returns:
           *
           * "docId": null
           *
           * Therefore use the database ID as a temporary display fallback.
           *
           * If backend starts returning docId, it will automatically be used.
           */
          issueNo:
            item.docId !== null && item.docId !== undefined
              ? item.docId
              : item.id
                ? `PBI-${item.id}`
                : "",

          docId: item.docId || "",

          /* ------------------------------------------------------------------ */
          /* Date                                                               */
          /* ------------------------------------------------------------------ */

          date: item.date || item.docDate || "",
          docDate: item.docDate || "",

          /* ------------------------------------------------------------------ */
          /* Plant / Branch                                                     */
          /* ------------------------------------------------------------------ */

          plant: item.branch?.branchName || item.branch?.branchCode || "",

          plantCode: item.branch?.branchCode || "",

          plantId: item.branch?.id || null,

          /* ------------------------------------------------------------------ */
          /* Belongs To                                                         */
          /* ------------------------------------------------------------------ */

          belongsTo: item.belongsTo || "",

          /* ------------------------------------------------------------------ */
          /* FG Item                                                             */
          /* ------------------------------------------------------------------ */

          fgItemCode: item.fgItem?.itemCode || "",

          fgItemDescription: item.fgItem?.itemDescription || "",

          fgItemId: item.fgItem?.id || null,

          fgItemUnit: item.fgItem?.unit || "",

          /* ------------------------------------------------------------------ */
          /* Indent                                                              */
          /* ------------------------------------------------------------------ */

          indentNo: item.indentNo || "",

          /* ------------------------------------------------------------------ */
          /* Purchase Material Reference                                         */
          /* ------------------------------------------------------------------ */

          purchaseMaterialRef: item.purchaseMaterialRef || "",

          /* ------------------------------------------------------------------ */
          /* Reference Number                                                    */
          /* Backend field is refNo, NOT referenceNo                           */
          /* ------------------------------------------------------------------ */

          referenceNo: item.refNo || "",

          /* ------------------------------------------------------------------ */
          /* Type                                                               */
          /* Backend field is type                                              */
          /* ------------------------------------------------------------------ */

          issueType: item.type || "",

          /* ------------------------------------------------------------------ */
          /* From Location                                                       */
          /* ------------------------------------------------------------------ */

          fromLocation:
            item.fromLocation?.locationName ||
            item.fromLocation?.locationCode ||
            "",

          fromLocationCode: item.fromLocation?.locationCode || "",

          fromLocationId: item.fromLocation?.id || null,

          /* ------------------------------------------------------------------ */
          /* To Location                                                         */
          /* ------------------------------------------------------------------ */

          toLocation:
            item.toLocation?.locationName ||
            item.toLocation?.locationCode ||
            "",

          toLocationCode: item.toLocation?.locationCode || "",

          toLocationId: item.toLocation?.id || null,

          /* ------------------------------------------------------------------ */
          /* Created / Updated By                                                */
          /* ------------------------------------------------------------------ */

          createdBy: item.createdBy || "",

          updatedBy: item.updatedBy || "",

          /* ------------------------------------------------------------------ */
          /* Active / Status                                                     */
          /* ------------------------------------------------------------------ */

          active: item.active === true,

          activeStatus: item.active,

          /* ------------------------------------------------------------------ */
          /* Cancel                                                              */
          /* ------------------------------------------------------------------ */

          cancel: item.cancel === true,

          cancelRemarks: item.cancelRemarks || "",

          /* ------------------------------------------------------------------ */
          /* Screen Information                                                  */
          /* ------------------------------------------------------------------ */

          screenName: item.screenName || "",

          screenCode: item.screenCode || "",

          /* ------------------------------------------------------------------ */
          /* Organization                                                        */
          /* ------------------------------------------------------------------ */

          orgId: item.orgId || null,

          financialYear: item.financialYear || "",

          /* ------------------------------------------------------------------ */
          /* Details                                                             */
          /* ------------------------------------------------------------------ */

          details: Array.isArray(item.details) ? item.details : [],

          productionBulkIssueDetailsResponseDTO: Array.isArray(
            item.productionBulkIssueDetailsResponseDTO,
          )
            ? item.productionBulkIssueDetailsResponseDTO
            : [],
        };
      });

      /* ---------------------------------------------------------------------- */
      /* Sort Newest First                                                      */
      /* ---------------------------------------------------------------------- */

      transformedData.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      console.log("Production Bulk Issues Transformed:", transformedData);

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading production bulk issues:", error);

      setItemData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Initial Load                                                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const orgId = localStorage.getItem("orgId");
    const branchId = localStorage.getItem("branchId");

    loadItems(orgId, branchId);
  }, [loadItems]);

  /* -------------------------------------------------------------------------- */
  /* Edit                                                                       */
  /* -------------------------------------------------------------------------- */

  const handleEdit = (item) => {
    console.log("Editing Production Bulk Issue:", item);

    onEdit(item);
  };

  /* -------------------------------------------------------------------------- */
  /* Columns                                                                    */
  /* -------------------------------------------------------------------------- */

  const columns = [
    {
      key: "issueNo",
      label: "Issue No",
      accessor: "issueNo",
      type: "text",
      noWrap: true,
    },

    {
      key: "date",
      label: "Date",
      accessor: "date",
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
      noWrap: true,
    },

    {
      key: "purchaseMaterialRef",
      label: "Purchase Material Ref",
      accessor: "purchaseMaterialRef",
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

  /* -------------------------------------------------------------------------- */
  /* Search Fields                                                              */
  /* -------------------------------------------------------------------------- */

  const searchFields = [
    "issueNo",
    "date",
    "plant",
    "belongsTo",
    "fgItemCode",
    "fgItemDescription",
    "indentNo",
    "purchaseMaterialRef",
    "fromLocation",
    "toLocation",
    "createdBy",
  ];

  /* -------------------------------------------------------------------------- */
  /* Filters                                                                    */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */
  /* -------------------------------------------------------------------------- */

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
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="ProductionBulkIssues"
    />
  );
};

export default ProductionBulkIssueList;
