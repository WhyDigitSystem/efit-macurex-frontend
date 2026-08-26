import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import purchaseOrderAPI from "../../../api/Purchase/purchaseOrderAPI";
import { useToast } from "../../Toast/ToastContext";
import { generatePurchaseOrderPdf } from "../../../utils/purchaseOrderPdfGenerator";

const PurchaseOrderList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  /* -------------------------------------------------------------------------- */
  /* Load Purchase Orders                                                       */
  /* -------------------------------------------------------------------------- */

  const handleDownload = (item) => {
    try {
      generatePurchaseOrderPdf(item);
    } catch (error) {
      console.error("Error generating PO PDF:", error);
      addToast("Failed to generate PDF", "error");
    }
  };

  const loadItems = useCallback(async () => {
    setLoading(true);

    try {
      const orgId = localStorage.getItem("orgId");
      const branchId = localStorage.getItem("branchId");

      console.log("Purchase Order List Params:", {
        orgId,
        branchId,
      });

      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");

        setItemData([]);

        addToast("Organization or Branch is missing", "error");

        return;
      }

      /* ---------------------------------------------------------------------- */
      /* API Call                                                               */
      /* ---------------------------------------------------------------------- */

      const response = await purchaseOrderAPI.getPurchaseOrderByOrgId(
        orgId,
        branchId,
      );

      console.log("Purchase Order List Response:", response);

      /* ---------------------------------------------------------------------- */
      /* API Error                                                              */
      /* ---------------------------------------------------------------------- */

      if (response?.status === false) {
        const msg =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          "Failed to load purchase orders";

        console.warn(msg);

        setItemData([]);

        addToast(msg, "error");

        return;
      }

      /* ---------------------------------------------------------------------- */
      /* IMPORTANT                                                              */
      /*                                                                        */
      /* Actual backend response:                                              */
      /*                                                                        */
      /* response                                                              */
      /*   └── paramObjectsMap                                                 */
      /*        └── purchaseOrderVO                                            */
      /*             └── [                                                     */
      /*                  { ... }                                               */
      /*                ]                                                       */
      /* ---------------------------------------------------------------------- */

      const orders = Array.isArray(response?.paramObjectsMap?.purchaseOrderVO)
        ? response.paramObjectsMap.purchaseOrderVO
        : [];

      console.log("Purchase Orders Extracted:", orders);

      /* ---------------------------------------------------------------------- */
      /* No Records                                                             */
      /* ---------------------------------------------------------------------- */

      if (orders.length === 0) {
        console.warn("No Purchase Orders found");

        setItemData([]);

        return;
      }

      /* ---------------------------------------------------------------------- */
      /* Transform API Response                                                 */
      /* ---------------------------------------------------------------------- */

      const transformedData = orders.map((item) => {
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
           * docId: "BLR/POL/26-27/00001"
           *
           * Frontend table uses:
           * poNo
           */
          poNo: item.docId || "",

          docId: item.docId || "",

          /* ------------------------------------------------------------------ */
          /* Date                                                               */
          /* ------------------------------------------------------------------ */

          orderPlacedDate: item.orderPlacedDate || item.docDate || "",

          docDate: item.docDate || "",

          /* ------------------------------------------------------------------ */
          /* PO Type                                                            */
          /* ------------------------------------------------------------------ */

          poType: item.poType || "",

          /* ------------------------------------------------------------------ */
          /* Belongs To                                                         */
          /* ------------------------------------------------------------------ */

          belongsTo: item.belongsTo || "",

          /* ------------------------------------------------------------------ */
          /* Branch                                                             */
          /* ------------------------------------------------------------------ */

          branch: item.branch?.branchCode || item.branch?.branchName || "",

          branchCode: item.branch?.branchCode || "",

          branchName: item.branch?.branchName || "",

          /* ------------------------------------------------------------------ */
          /* Department                                                         */
          /* ------------------------------------------------------------------ */

          department:
            item.department?.departmentName ||
            item.department?.departmentCode ||
            "",

          departmentCode: item.department?.departmentCode || "",

          departmentName: item.department?.departmentName || "",

          /* ------------------------------------------------------------------ */
          /* Supplier                                                           */
          /* ------------------------------------------------------------------ */

          supplierCode: item.supplierCode?.supplierCode || "",

          supplierName: item.supplierCode?.supplierName || "",

          supplierId: item.supplierCode?.id || null,

          /* ------------------------------------------------------------------ */
          /* Currency                                                           */
          /* ------------------------------------------------------------------ */

          currency: item.currency?.currencyName || "",

          currencyId: item.currency?.id || null,

          /* ------------------------------------------------------------------ */
          /* Financial Year                                                     */
          /* ------------------------------------------------------------------ */

          financialYear: item.financialYear || "",

          /* ------------------------------------------------------------------ */
          /* Amount                                                             */
          /* ------------------------------------------------------------------ */

          totalPoValueInr: item.totalPoValueInr ?? 0,

          totalPoValueFc: item.totalPoValueFc ?? 0,

          totalAmount: item.totalAmount ?? 0,

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
          /* Remarks                                                            */
          /* ------------------------------------------------------------------ */

          cancelRemarks: item.cancelRemarks || "",

          remarks: item.remarks || "",

          /* ------------------------------------------------------------------ */
          /* Local Details                                                      */
          /* ------------------------------------------------------------------ */

          purchaseOrderLocalDetailsDTO:
            item.purchaseOrderLocalDetailsResponseDTO || [],

          /* ------------------------------------------------------------------ */
          /* Import Details                                                     */
          /* ------------------------------------------------------------------ */

          purchaseOrderImportDetailsDTO:
            item.purchaseOrderImportDetailsResponseDTO || [],

          /* ------------------------------------------------------------------ */
          /* Tax Details                                                        */
          /* ------------------------------------------------------------------ */

          purchaseOrderLocalTaxDetailsDTO:
            item.purchaseOrderLocalTaxDetailsResponseDTO || [],

          /* ------------------------------------------------------------------ */
          /* File Attachments                                                   */
          /* ------------------------------------------------------------------ */

          purchaseOrderLocalFileUploadDetailsDTO:
            item.purchaseOrderLocalFileUploadDetailsResponseDTO || [],

          /* ------------------------------------------------------------------ */
          /* Common flags                                                       */
          /* ------------------------------------------------------------------ */

          isIgstApplicable: item.isIgstApplicable || "",

          isReverseCharge: item.isReverseCharge || "",

          indentRequired: item.indentRequired || "",

          itemType: item.itemType || "",

          /* ------------------------------------------------------------------ */
          /* Other fields                                                       */
          /* ------------------------------------------------------------------ */

          termsAndConditions: item.termsAndConditions || "",

          notes: item.notes || "",

          deliveryTerms: item.deliveryTerms || "",

          paymentTerms: item.paymentTerms || "",

          freightType: item.freightType || "",

          packingType: item.packingType || "",

          modeOfDespatch: item.modeOfDespatch || "",
        };
      });

      /* ---------------------------------------------------------------------- */
      /* Sort Latest First                                                      */
      /* ---------------------------------------------------------------------- */

      transformedData.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      console.log("Final Purchase Order Table Data:", transformedData);

      /* ---------------------------------------------------------------------- */
      /* Set Table Data                                                         */
      /* ---------------------------------------------------------------------- */

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading purchase orders:", error);

      setItemData([]);

      addToast("Failed to fetch purchase orders", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  /* -------------------------------------------------------------------------- */
  /* Initial Load                                                              */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  /* -------------------------------------------------------------------------- */
  /* Edit                                                                      */
  /* -------------------------------------------------------------------------- */

  const handleEdit = (item) => {
    console.log("Editing Purchase Order:", item);

    onEdit(item);
  };

  /* -------------------------------------------------------------------------- */
  /* Columns                                                                    */
  /* -------------------------------------------------------------------------- */

  const columns = [
    {
      key: "poNo",
      label: "P.O.No",
      accessor: "poNo",
      type: "text",
      noWrap: true,
    },

    {
      key: "poType",
      label: "P.Type",
      accessor: "poType",
      type: "text",
    },

    {
      key: "orderPlacedDate",
      label: "Date",
      accessor: "orderPlacedDate",
      type: "date",
    },

    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },

    {
      key: "supplierCode",
      label: "Supplier Code",
      accessor: "supplierCode",
      type: "text",
    },

    {
      key: "financialYear",
      label: "Fin. Year",
      accessor: "financialYear",
      type: "text",
    },

    {
      key: "totalPoValueInr",
      label: "PO Value (INR)",
      accessor: "totalPoValueInr",
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
    "poNo",
    "poType",
    "belongsTo",
    "supplierCode",
    "supplierName",
    "createdBy",
    "financialYear",
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
      value: "local",
      label: "Local",
      field: "poType",
      filterValue: "Local",
      activeValue: "Local",
    },

    {
      value: "import",
      label: "Import",
      field: "poType",
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

  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <CommonListViewTable
      title="Purchase Order"
      data={itemData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onDownload={handleDownload}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Purchase Orders found"
      loadingMessage="Loading Purchase Orders..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="PurchaseOrders"
    />
  );
};

export default PurchaseOrderList;
