import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import productionIssueAPI from "../../../api/Production/productionIssueAPI";

const ProductionIssueList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* Load Production Issues                                                     */
  /* -------------------------------------------------------------------------- */

  const loadItems = useCallback(async (orgId, branchId) => {
    setLoading(true);

    try {
      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");
        setItemData([]);
        return;
      }

      const response = await productionIssueAPI.getByOrgId(orgId, branchId);

      console.log("Production Issues API Response:", response);

      /* ---------------------------------------------------------------------- */
      /* API Error Check                                                        */
      /* ---------------------------------------------------------------------- */

      if (response?.status === false) {
        const msg =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          "Failed to load production issues";

        console.warn(msg);
        setItemData([]);
        return;
      }

      /* ---------------------------------------------------------------------- */
      /* Get Production Issue List                                             */
      /* ---------------------------------------------------------------------- */

      const issues = Array.isArray(
        response?.paramObjectsMap?.productionIssueResponseVO,
      )
        ? response.paramObjectsMap.productionIssueResponseVO
        : [];

      console.log("Production Issues:", issues);

      if (issues.length === 0) {
        setItemData([]);
        return;
      }

      /* ---------------------------------------------------------------------- */
      /* Transform API Response                                                 */
      /* ---------------------------------------------------------------------- */

      const transformedData = issues.map((item) => ({
        /* ------------------------------------------------------------------ */
        /* Main ID                                                            */
        /* ------------------------------------------------------------------ */

        id: item.id,

        /* ------------------------------------------------------------------ */
        /* Document                                                            */
        /* ------------------------------------------------------------------ */

        /*
         * Backend currently returns docId = null.
         *
         * Therefore use a temporary display number based on ID.
         * If docId is returned later, it will automatically be used.
         */
        issueNo:
          item.docId !== null && item.docId !== undefined
            ? item.docId
            : item.id
              ? `PI-${item.id}`
              : "",

        docId: item.docId || "",

        /* ------------------------------------------------------------------ */
        /* Dates                                                               */
        /* ------------------------------------------------------------------ */

        issueDate: item.issueDate || item.docDate || "",

        docDate: item.docDate || "",

        /* ------------------------------------------------------------------ */
        /* Branch / Plant                                                      */
        /* ------------------------------------------------------------------ */

        plant: item.branch?.branchName || item.branch?.branchCode || "",

        plantCode: item.branch?.branchCode || "",

        plantId: item.branch?.id || null,

        /* ------------------------------------------------------------------ */
        /* Basic Information                                                   */
        /* ------------------------------------------------------------------ */

        belongsTo: item.belongsTo || "",

        /* ------------------------------------------------------------------ */
        /* FG Item                                                              */
        /* ------------------------------------------------------------------ */

        fgItemCode: item.fgItem?.itemCode || "",

        fgItemDescription: item.fgItem?.itemDescription || "",

        fgItemId: item.fgItem?.id || null,

        /* ------------------------------------------------------------------ */
        /* Indent                                                               */
        /* ------------------------------------------------------------------ */

        indentNo: item.indentNo || "",

        /* ------------------------------------------------------------------ */
        /* Schedule Order                                                      */
        /* Backend field = schOrderNo                                         */
        /* ------------------------------------------------------------------ */

        scheduleOrderNo: item.schOrderNo || "",

        /* ------------------------------------------------------------------ */
        /* Type                                                                 */
        /* ------------------------------------------------------------------ */

        issueType: item.type || "",

        /* ------------------------------------------------------------------ */
        /* From Location                                                        */
        /* ------------------------------------------------------------------ */

        fromLocation:
          item.fromLocation?.locationName ||
          item.fromLocation?.locationCode ||
          "",

        fromLocationCode: item.fromLocation?.locationCode || "",

        fromLocationId: item.fromLocation?.id || null,

        /* ------------------------------------------------------------------ */
        /* To Location                                                          */
        /* ------------------------------------------------------------------ */

        toLocation:
          item.toLocation?.locationName || item.toLocation?.locationCode || "",

        toLocationCode: item.toLocation?.locationCode || "",

        toLocationId: item.toLocation?.id || null,

        /* ------------------------------------------------------------------ */
        /* Amount                                                               */
        /* ------------------------------------------------------------------ */

        totalValue: item.totalValue ?? 0,

        /* ------------------------------------------------------------------ */
        /* Narration                                                            */
        /* ------------------------------------------------------------------ */

        narration: item.narration || "",

        /* ------------------------------------------------------------------ */
        /* Created / Updated By                                                 */
        /* ------------------------------------------------------------------ */

        createdBy: item.createdBy || "",

        updatedBy: item.updatedBy || "",

        /* ------------------------------------------------------------------ */
        /* Status                                                               */
        /* ------------------------------------------------------------------ */

        active:
          item.active === true ||
          String(item.active).toLowerCase() === "active",

        activeStatus: item.active || "",

        /* ------------------------------------------------------------------ */
        /* Cancel                                                               */
        /* ------------------------------------------------------------------ */

        cancel:
          item.cancel === true || String(item.cancel).toUpperCase() === "T",

        cancelRemarks: item.cancelRemarks || "",

        /* ------------------------------------------------------------------ */
        /* Screen Information                                                   */
        /* ------------------------------------------------------------------ */

        screenName: item.screenName || "",

        screenCode: item.screenCode || "",

        /* ------------------------------------------------------------------ */
        /* Organization                                                         */
        /* ------------------------------------------------------------------ */

        orgId: item.orgId || null,

        financialYear: item.financialYear || "",

        /* ------------------------------------------------------------------ */
        /* Item Details                                                         */
        /* ------------------------------------------------------------------ */

        itemDetails: Array.isArray(item.itemDetails) ? item.itemDetails : [],

        productionIssueDetailsResponseDTO: Array.isArray(
          item.productionIssueDetailsResponseDTO,
        )
          ? item.productionIssueDetailsResponseDTO
          : [],
      }));

      /* ---------------------------------------------------------------------- */
      /* Sort Newest First                                                      */
      /* ---------------------------------------------------------------------- */

      transformedData.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      console.log("Production Issues Transformed:", transformedData);

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading production issues:", error);

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
    console.log("Editing Production Issue:", item);

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
      noWrap: true,
    },

    {
      key: "scheduleOrderNo",
      label: "Sch. Order No",
      accessor: "scheduleOrderNo",
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
      key: "totalValue",
      label: "Total Value",
      accessor: "totalValue",
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
    "issueDate",
    "plant",
    "belongsTo",
    "fgItemCode",
    "fgItemDescription",
    "indentNo",
    "scheduleOrderNo",
    "issueType",
    "fromLocation",
    "toLocation",
    "totalValue",
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
      title="Production Issue"
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
      emptyMessage="No Production Issues found"
      loadingMessage="Loading Production Issues..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="ProductionIssues"
    />
  );
};

export default ProductionIssueList;
