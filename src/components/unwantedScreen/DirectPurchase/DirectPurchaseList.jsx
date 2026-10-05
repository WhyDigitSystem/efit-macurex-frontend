import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import directPurchaseAPI from "../../../api/Purchase/directPurchaseAPI";
import { useToast } from "../../Toast/ToastContext";

const DirectPurchaseList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  /* -------------------------------------------------------------------- */
  /* Load Direct Purchases                                                 */
  /* -------------------------------------------------------------------- */

  const loadItems = useCallback(async () => {
    setLoading(true);

    try {
      const orgId = localStorage.getItem("orgId");
      const branchId = localStorage.getItem("branchId");

      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");

        setItemData([]);

        addToast("Organization or Branch is missing", "error");

        return;
      }

      const response = await directPurchaseAPI.getDirectPurchaseByOrgId(
        branchId,
        orgId,
      );

      if (response?.status === false) {
        const msg =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          "Failed to load direct purchases";

        console.warn(msg);

        setItemData([]);

        return;
      }

      /*
       * response.paramObjectsMap.directPurchaseVO -> [ { ... } ]
       */
      const orders = Array.isArray(response?.paramObjectsMap?.directPurchaseVO)
        ? response.paramObjectsMap.directPurchaseVO
        : [];

      if (orders.length === 0) {
        setItemData([]);

        return;
      }

      const transformedData = orders.map((item) => {
        const branchObj =
          item.branch && typeof item.branch === "object" ? item.branch : null;

        return {
          /*
           * Keep EVERYTHING from the backend untouched (including `branch`
           * as the original object) so the edit form gets real ids.
           */
          ...item,

          id: item.id,

          /* display-only fields for the table */
          billNo: item.invNo || "",

          plant: branchObj
            ? branchObj.branchCode || branchObj.branchName || ""
            : String(item.branch ?? ""),

          supplierName: item.supplierName || "",

          active:
            item.active === true ||
            String(item.active).toLowerCase() === "active",

          activeStatus: item.active || "",
        };
      });

      transformedData.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading direct purchases:", error);

      setItemData([]);

      addToast("Failed to fetch direct purchases", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshTrigger]);

  /* -------------------------------------------------------------------- */
  /* Columns                                                                */
  /* -------------------------------------------------------------------- */

  const columns = [
    {
      key: "billNo",
      label: "Bill No",
      accessor: "billNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "invDate",
      label: "Bill Date",
      accessor: "invDate",
      type: "date",
    },
    {
      key: "plant",
      label: "Plant",
      accessor: "plant",
      type: "text",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: "supplierName",
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },
    {
      key: "suppType",
      label: "Supp. Type",
      accessor: "suppType",
      type: "text",
    },
    {
      key: "financialYear",
      label: "Fin. Year",
      accessor: "financialYear",
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
    "billNo",
    "plant",
    "supplierName",
    "belongsTo",
    "suppType",
    "financialYear",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "local",
      label: "Local",
      field: "suppType",
      filterValue: "Local",
      activeValue: "Local",
    },
    {
      value: "import",
      label: "Import",
      field: "suppType",
      filterValue: "Import",
      activeValue: "Import",
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
      title="Direct Purchase"
      data={itemData}
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
      emptyMessage="No Direct Purchase records found"
      loadingMessage="Loading Direct Purchase records..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="DirectPurchase"
    />
  );
};

export default DirectPurchaseList;
