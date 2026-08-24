import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import productionIssueAPI from "../../../api/Production/productionIssueAPI";
import { useToast } from "../../Toast/ToastContext";

const ProductionIssueList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* Load Production Issues                                                     */
  /* -------------------------------------------------------------------------- */

  const loadItems = useCallback(async (orgId, branchId) => {
    setLoading(true);

    try {
      console.log("Production Issue List Params:", {
        orgId,
        branchId,
      });

      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");

        setItemData([]);

        return;
      }

      /* ---------------------------------------------------------------------- */
      /* API Call                                                               */
      /* ---------------------------------------------------------------------- */

      const response = await productionIssueAPI.getByOrgId(
        orgId,
        branchId,
      );

      console.log("Production Issue List Response:", response);

      /* ---------------------------------------------------------------------- */
      /* API Error                                                              */
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
      /* IMPORTANT                                                              */
      /*                                                                        */
      /* Actual backend response:                                              */
      /*                                                                        */
      /* response                                                              */
      /*   └── paramObjectsMap                                                 */
      /*        └── productionIssueList                                        */
      /*             └── [                                                     */
      /*                  { ... }                                               */
      /*                ]                                                       */
      /* ---------------------------------------------------------------------- */

      const issues = Array.isArray(response?.paramObjectsMap?.productionIssueList)
        ? response.paramObjectsMap.productionIssueList
        : [];

      console.log("Production Issues Extracted:", issues);

      /* ---------------------------------------------------------------------- */
      /* No Records                                                             */
      /* ---------------------------------------------------------------------- */

      if (issues.length === 0) {
        console.warn("No Production Issues found");

        setItemData([]);

        return;
      }

      /* ---------------------------------------------------------------------- */
      /* Transform API Response                                                 */
      /* ---------------------------------------------------------------------- */

      const transformedData = issues.map((item) => {
        return {
          /* ------------------------------------------------------------------ */
          /* Keep complete backend object                                       */
          /* ------------------------------------------------------------------ */

          ...item,

          /* ------------------------------------------------------------------ */
          /* Basic Fields                                                       */
          /* ------------------------------------------------------------------ */

          id: item.id,

          /*
           * Backend sends:
           * docId: "BLR/PI/26-27/00001"
           *
           * Frontend table uses:
           * issueNo
           */
          issueNo: item.docId || "",

          docId: item.docId || "",

          /* ------------------------------------------------------------------ */
          /* Date                                                               */
          /* ------------------------------------------------------------------ */

          issueDate: item.issueDate || item.docDate || "",

          docDate: item.docDate || "",

          /* ------------------------------------------------------------------ */
          /* Plant                                                              */
          /* ------------------------------------------------------------------ */

          plant: item.plant?.plantName || item.plant?.plantId || "",

          plantId: item.plant?.id || "",

          /* ------------------------------------------------------------------ */
          /* Belongs To                                                         */
          /* ------------------------------------------------------------------ */

          belongsTo: item.belongsTo || "",

          /* ------------------------------------------------------------------ */
          /* FG Item                                                            */
          /* ------------------------------------------------------------------ */

          fgItemCode: item.fgItem?.itemCode || "",
          fgItemDescription: item.fgItem?.itemDescription || "",
          fgItemId: item.fgItem?.id || null,

          /* ------------------------------------------------------------------ */
          /* Indent                                                             */
          /* ------------------------------------------------------------------ */

          indentNo: item.indent?.docId || item.indentNo || "",

          /* ------------------------------------------------------------------ */
          /* Schedule Order                                                     */
          /* ------------------------------------------------------------------ */

          scheduleOrderNo: item.scheduleOrder?.docId || item.scheduleOrderNo || "",

          /* ------------------------------------------------------------------ */
          /* Type                                                               */
          /* ------------------------------------------------------------------ */

          issueType: item.issueType || "",

          /* ------------------------------------------------------------------ */
          /* Locations                                                          */
          /* ------------------------------------------------------------------ */

          fromLocation: item.fromLocation?.locationName || item.fromLocation?.locationCode || "",
          fromLocationCode: item.fromLocation?.locationCode || "",
          fromLocationId: item.fromLocation?.id || null,

          toLocation: item.toLocation?.locationName || item.toLocation?.locationCode || "",
          toLocationCode: item.toLocation?.locationCode || "",
          toLocationId: item.toLocation?.id || null,

          /* ------------------------------------------------------------------ */
          /* Summary                                                            */
          /* ------------------------------------------------------------------ */

          totalValue: item.totalValue ?? 0,

          narration: item.narration || "",

          /* ------------------------------------------------------------------ */
          /* Status                                                             */
          /* ------------------------------------------------------------------ */

          /*
           * Backend sends:
           *
           * active: "Active"
           *
           * Convert it into boolean because
           * CommonListViewTable status expects true/false.
           */
          active:
            item.active === true ||
            String(item.active).toLowerCase() === "active",

          /* Keep original status text */
          activeStatus: item.active || "",

          /* ------------------------------------------------------------------ */
          /* Created By                                                         */
          /* ------------------------------------------------------------------ */

          createdBy: item.createdBy || item.preparedBy || "",

          preparedBy: item.preparedBy || "",

          /* ------------------------------------------------------------------ */
          /* Details                                                            */
          /* ------------------------------------------------------------------ */

          productionIssueDetailsDTO:
            item.productionIssueDetailsResponseDTO || [],
        };
      });

      /* ---------------------------------------------------------------------- */
      /* Sort Latest First                                                      */
      /* ---------------------------------------------------------------------- */

      transformedData.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      console.log("Final Production Issue Table Data:", transformedData);

      /* ---------------------------------------------------------------------- */
      /* Set Table Data                                                         */
      /* ---------------------------------------------------------------------- */

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading production issues:", error);

      setItemData([]);
    } finally {
      setLoading(false);
    }
  }, [productionIssueAPI]);

  /* -------------------------------------------------------------------------- */
  /* Initial Load                                                              */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const orgId = localStorage.getItem("orgId");
    const branchId = localStorage.getItem("branchId");

    loadItems(orgId, branchId);
  }, [loadItems]);

  /* -------------------------------------------------------------------------- */
  /* Edit                                                                      */
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
    "plant",
    "belongsTo",
    "fgItemCode",
    "fgItemDescription",
    "indentNo",
    "scheduleOrderNo",
    "issueType",
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