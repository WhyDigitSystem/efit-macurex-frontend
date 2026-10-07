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

      if (response?.status === false) {
        const msg =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          "Failed to load production issues";

        console.warn(msg);
        setItemData([]);
        return;
      }

      const issues = Array.isArray(
        response?.paramObjectsMap?.productionIssueResponseVO,
      )
        ? response.paramObjectsMap.productionIssueResponseVO
        : [];

      if (issues.length === 0) {
        setItemData([]);
        return;
      }

      const transformedData = issues.map((item) => ({
        id: item.id,

        /* Backend may return docId = null; show a temporary PI-<id>.
           The form strips this placeholder before saving. */
        issueNo:
          item.docId !== null && item.docId !== undefined
            ? item.docId
            : item.id
              ? `PI-${item.id}`
              : "",

        docId: item.docId || "",

        /* Raw backend values — the form reads these when editing.
           issueDate is the indent reference date, so it must NOT fall
           back to docDate here. */
        issueDate: item.issueDate || "",
        docDate: item.docDate || "",

        /* Column display only */
        displayDate: item.issueDate || item.docDate || "",

        plant: item.branch?.branchName || item.branch?.branchCode || "",
        plantCode: item.branch?.branchCode || "",
        plantId: item.branch?.id || null,

        /* Keep the nested object so the form can read branch.id directly */
        branch: item.branch || null,

        belongsTo: item.belongsTo || "",

        fgItemCode: item.fgItem?.itemCode || "",
        fgItemDescription: item.fgItem?.itemDescription || "",
        fgItemId: item.fgItem?.id || null,
        fgItem: item.fgItem || null,

        indentNo: item.indentNo || "",

        scheduleOrderNo: item.schOrderNo || "",
        schOrderNo: item.schOrderNo || "",

        issueType: item.type || "",
        type: item.type || "",

        fromLocationName:
          item.fromLocation?.locationName ||
          item.fromLocation?.locationCode ||
          "",
        fromLocationCode: item.fromLocation?.locationCode || "",
        fromLocationId: item.fromLocation?.id || null,
        fromLocationObj: item.fromLocation || null,

        toLocationName:
          item.toLocation?.locationName || item.toLocation?.locationCode || "",
        toLocationCode: item.toLocation?.locationCode || "",
        toLocationId: item.toLocation?.id || null,
        toLocationObj: item.toLocation || null,

        totalValue: item.totalValue ?? 0,
        narration: item.narration || "",

        createdBy: item.createdBy || "",
        updatedBy: item.updatedBy || "",

        active:
          item.active === true ||
          String(item.active).toLowerCase() === "active",
        activeStatus: item.active || "",

        cancel:
          item.cancel === true || String(item.cancel).toUpperCase() === "T",
        cancelRemarks: item.cancelRemarks || "",

        screenName: item.screenName || "",
        screenCode: item.screenCode || "",

        orgId: item.orgId || null,
        financialYear: item.financialYear || "",

        itemDetails: Array.isArray(item.itemDetails) ? item.itemDetails : [],

        productionIssueDetailsResponseDTO: Array.isArray(
          item.productionIssueDetailsResponseDTO,
        )
          ? item.productionIssueDetailsResponseDTO
          : [],
      }));

      transformedData.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading production issues:", error);
      setItemData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Initial Load + Refresh                                                     */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* Edit                                                                       */
  /* -------------------------------------------------------------------------- */

  const handleEdit = (item) => {
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
      key: "displayDate",
      label: "Issue Date",
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
      key: "scheduleOrderNo",
      label: "Sch. Order No",
      accessor: "scheduleOrderNo",
      type: "text",
    },
    { key: "issueType", label: "Type", accessor: "issueType", type: "text" },
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
    "displayDate",
    "plant",
    "belongsTo",
    "fgItemCode",
    "fgItemDescription",
    "indentNo",
    "scheduleOrderNo",
    "issueType",
    "fromLocationName",
    "toLocationName",
    "totalValue",
    "createdBy",
  ];

  /* -------------------------------------------------------------------------- */
  /* Filters                                                                    */
  /* -------------------------------------------------------------------------- */

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
      onRefresh={handleRefresh}
      enableExport={true}
      exportFileName="ProductionIssues"
    />
  );
};

export default ProductionIssueList;
