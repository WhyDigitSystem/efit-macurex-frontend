import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import openingStockEntryAPI from "../../../api/Inventory/openingStockEntryAPI";
import { toast } from "../../../utils/toast";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getItemCode = (item) => {
  if (!item) return "";

  if (typeof item === "string") {
    return item;
  }

  return item?.itemCode || item?.code || item?.item_code || "";
};

const getItemDescription = (item) => {
  if (!item || typeof item === "string") {
    return "";
  }

  return (
    item?.itemDescription ||
    item?.description ||
    item?.itemName ||
    item?.name ||
    ""
  );
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const OpeningStockEntryList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* Local Storage                                                          */
  /* ---------------------------------------------------------------------- */

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  /* ---------------------------------------------------------------------- */
  /* Load Opening Stock Entries                                             */
  /* ---------------------------------------------------------------------- */

  const loadStockEntries = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      console.warn("Opening Stock Entry: orgId or branchId missing");

      setStockData([]);

      return;
    }

    try {
      setLoading(true);

      console.log("==================================================");

      console.log("OPENING STOCK ENTRY - LOAD LIST");

      console.log("==================================================");

      console.log("ORG_ID:", ORG_ID);
      console.log("BRANCH_ID:", BRANCH_ID);

      /* ------------------------------------------------------------------ */
      /* API CALL                                                           */
      /* ------------------------------------------------------------------ */

      const response = await openingStockEntryAPI.getByOrgId(ORG_ID, BRANCH_ID);

      console.log("Opening Stock Entry API Result:", response);

      console.log("Is API Result Array:", Array.isArray(response));

      /* ------------------------------------------------------------------ */
      /* API already returns array                                          */
      /* ------------------------------------------------------------------ */

      const list = Array.isArray(response) ? response : [];

      console.log("Opening Stock Entry List:", list);

      console.log("Opening Stock Entry Count:", list.length);

      /* ------------------------------------------------------------------ */
      /* Transform                                                          */
      /* ------------------------------------------------------------------ */

      const transformedList = list.map((row) => {
        const item = row?.item;

        const itemCode =
          getItemCode(item) || row?.itemCode || row?.item_code || "";

        const itemDescription =
          getItemDescription(item) ||
          row?.itemDescription ||
          row?.itemDesc ||
          row?.description ||
          "";

        const quantity = row?.qty ?? row?.quantity ?? "";

        const transformedRow = {
          /* ------------------------------------------------------------ */
          /* Keep original backend response                              */
          /* ------------------------------------------------------------ */

          ...row,

          /* ------------------------------------------------------------ */
          /* ID                                                           */
          /* ------------------------------------------------------------ */

          id: row?.id ?? "",

          /* ------------------------------------------------------------ */
          /* Branch                                                       */
          /* ------------------------------------------------------------ */

          branchId: row?.branch?.id ?? row?.branchId ?? null,

          branchCode: row?.branch?.branchCode || row?.branchCode || "",

          branchName: row?.branch?.branchName || row?.branchName || "",

          /* ------------------------------------------------------------ */
          /* Dates                                                        */
          /* ------------------------------------------------------------ */

          asOnDate: row?.asOnDate || "",

          docDate: row?.docDate || "",

          /* ------------------------------------------------------------ */
          /* Document ID                                                  */
          /* ------------------------------------------------------------ */

          docId: row?.docId || "",

          /* ------------------------------------------------------------ */
          /* Location                                                     */
          /* ------------------------------------------------------------ */

          locationId: row?.location?.id ?? row?.locationId ?? null,

          locationName:
            row?.location?.locationName ||
            row?.location?.name ||
            row?.locationName ||
            "",

          /* ------------------------------------------------------------ */
          /* Item                                                         */
          /* ------------------------------------------------------------ */

          itemId: row?.item?.id ?? row?.itemId ?? null,

          itemCode,

          itemDescription,

          /* ------------------------------------------------------------ */
          /* Unit                                                         */
          /* ------------------------------------------------------------ */

          unit:
            row?.unit?.unitName ||
            row?.unit?.name ||
            row?.unitName ||
            row?.unit ||
            "",

          /* ------------------------------------------------------------ */
          /* Quantity                                                     */
          /* ------------------------------------------------------------ */

          quantity,

          /* ------------------------------------------------------------ */
          /* Rate                                                         */
          /* ------------------------------------------------------------ */

          rate: row?.rate ?? "",

          /* ------------------------------------------------------------ */
          /* Amount                                                       */
          /* ------------------------------------------------------------ */

          amount: row?.amount ?? "",

          /* ------------------------------------------------------------ */
          /* Remarks                                                      */
          /* ------------------------------------------------------------ */

          remarks: row?.remarks || "",

          /* ------------------------------------------------------------ */
          /* Active                                                       */
          /* ------------------------------------------------------------ */

          active: Boolean(row?.active),

          /* ------------------------------------------------------------ */
          /* Other                                                        */
          /* ------------------------------------------------------------ */

          orgId: row?.orgId ?? null,

          createdBy: row?.createdBy || "",

          cancelRemarks: row?.cancelRemarks || "",
        };

        return transformedRow;
      });

      /* ------------------------------------------------------------------ */
      /* Sort newest first                                                  */
      /* ------------------------------------------------------------------ */

      const sortedList = [...transformedList].sort(
        (a, b) => Number(b?.id || 0) - Number(a?.id || 0),
      );

      console.log("==================================================");

      console.log("FINAL TABLE DATA:", sortedList);

      console.log("FINAL TABLE DATA COUNT:", sortedList.length);

      console.log("==================================================");

      setStockData(sortedList);
    } catch (error) {
      console.error("Failed to load Opening Stock Entry:", error);

      console.error("Error response:", error?.response?.data);

      setStockData([]);

      toast.error("Failed to fetch Opening Stock Entry records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  /* ---------------------------------------------------------------------- */
  /* Load on Mount / Refresh                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    loadStockEntries();
  }, [loadStockEntries, refreshTrigger]);

  /* ---------------------------------------------------------------------- */
  /* Columns                                                               */
  /* ---------------------------------------------------------------------- */

  const columns = [
    /* ------------------------------------------------------------------ */
    /* ID                                                                  */
    /* ------------------------------------------------------------------ */

    {
      key: "id",
      label: "ID",
      accessor: (row) => row?.id ?? "",
      type: "text",
    },

    /* ------------------------------------------------------------------ */
    /* Plant                                                               */
    /* ------------------------------------------------------------------ */

    {
      key: "branchName",
      label: "Plant",
      accessor: (row) => row?.branchName || row?.branchCode || "",
      type: "text",
    },

    /* ------------------------------------------------------------------ */
    /* As On Date                                                          */
    /* ------------------------------------------------------------------ */

    {
      key: "asOnDate",
      label: "As On Date",
      accessor: (row) => String(row?.asOnDate || "").slice(0, 10),
      type: "text",
    },

    /* ------------------------------------------------------------------ */
    /* Location                                                            */
    /* ------------------------------------------------------------------ */

    {
      key: "locationName",
      label: "Location",
      accessor: (row) => row?.locationName || "",
      type: "text",
    },

    /* ------------------------------------------------------------------ */
    /* Item Code                                                           */
    /* ------------------------------------------------------------------ */

    /* ------------------------------------------------------------------ */
    /* Quantity                                                            */
    /* ------------------------------------------------------------------ */

    // {
    //   key: "quantity",
    //   label: "Qty",
    //   accessor: (row) => row?.quantity ?? "",
    //   type: "text",
    // },

    /* ------------------------------------------------------------------ */
    /* Rate                                                                */
    /* ------------------------------------------------------------------ */

    {
      key: "rate",
      label: "Rate",
      accessor: (row) => row?.rate ?? "",
      type: "text",
    },

    /* ------------------------------------------------------------------ */
    /* Amount                                                              */
    /* ------------------------------------------------------------------ */

    {
      key: "amount",
      label: "Amount",
      accessor: (row) => row?.amount ?? "",
      type: "text",
    },

    /* ------------------------------------------------------------------ */
    /* Remarks                                                             */
    /* ------------------------------------------------------------------ */

    {
      key: "remarks",
      label: "Remarks",
      accessor: (row) => row?.remarks || "",
      type: "text",
    },

    /* ------------------------------------------------------------------ */
    /* Status                                                              */
    /* ------------------------------------------------------------------ */

    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",

      statusVariants: {
        Active: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 " +
            "dark:bg-green-900/30 " +
            "dark:text-green-300",
        },

        Inactive: {
          label: "Inactive",
          className:
            "bg-red-100 text-red-700 " +
            "dark:bg-red-900/30 " +
            "dark:text-red-300",
        },
      },
    },

    /* ------------------------------------------------------------------ */
    /* Actions                                                             */
    /* ------------------------------------------------------------------ */

    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  /* ---------------------------------------------------------------------- */
  /* Search Fields                                                         */
  /* ---------------------------------------------------------------------- */

  const searchFields = [
    "id",
    "docId",
    "branchName",
    "branchCode",
    "locationName",
    "itemCode",
    "itemDescription",
    "asOnDate",
    "docDate",
    "quantity",
    "rate",
    "amount",
    "remarks",
  ];

  /* ---------------------------------------------------------------------- */
  /* Filters                                                               */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <CommonListViewTable
      title="Opening Stock Entry"
      data={stockData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      filterInHeader={true}
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Opening Stock Entry records found"
      loadingMessage="Loading Opening Stock Entry..."
      enableRefresh={true}
      onRefresh={loadStockEntries}
      enableExport={true}
      exportFileName="OpeningStockEntry"
    />
  );
};

export default OpeningStockEntryList;
