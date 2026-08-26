// PoShortCloseListView.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import poDelScheduleAPI from "../../../api/Purchase/poDeliverySchShortClose";

const PoShortCloseListView = ({ onAddNew, onEdit, onBack }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const dataLoadedRef = useRef(false);

    const ORG_ID = localStorage.getItem("orgId");
    const BRANCH_ID = localStorage.getItem("branchId");

    const loadData = useCallback(async () => {
        if (!ORG_ID || !BRANCH_ID) {
            console.error("OrgId or BranchId not found in localStorage");
            return;
        }

        if (dataLoadedRef.current) return;

        setLoading(true);
        try {
            const response = await poDelScheduleAPI.getPurchaseOrderDeliveryScheduleShortCloseByOrgId(
                BRANCH_ID,
                ORG_ID
            );

            console.log("API Response:", response);

            let records = [];

            if (response?.status && response?.paramObjectsMap?.purchaseOrderDeliveryScheduleShortCloseVO) {
                records = response.paramObjectsMap.purchaseOrderDeliveryScheduleShortCloseVO;
            } else if (Array.isArray(response)) {
                records = response;
            } else if (response?.purchaseOrderDeliveryScheduleShortCloseVO) {
                records = response.purchaseOrderDeliveryScheduleShortCloseVO;
            }

            // Transform the data for the table
            const transformedData = records.map((item) => ({
                id: item.id,
                shortCloseNo: item.docId || "",
                plantId: item.branch?.branchName || item.branch?.branchCode || item.branch?.id || "",
                supplierCode: item.supplierCode?.supplierCode || "",
                supplierName: item.supplierCode?.supplierName || "",
                poNo: item.purchaseOrderScheduleNo || "",
                shortCloseDate: item.docDate || "",
                totalPendingQty: item.purchaseOrderDeliveryScheduleShortCloseDetailsResponseDTO?.reduce(
                    (total, detail) => total + (detail.pendingQty || 0), 0
                ).toFixed(3) || "0.000",
                orderStatus: item.active === "Active" ? "Approved" : "Pending",
                active: item.active === "Active",
                narration: item.narration || "",
                referenceForShortClose: item.referenceForShortClose || "",
                type: item.type || "",
                belongsTo: item.belongsTo || "",
                details: item.purchaseOrderDeliveryScheduleShortCloseDetailsResponseDTO || [],
            }));

            // Sort by id descending (newest first)
            transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));

            setData(transformedData);
            dataLoadedRef.current = true;
        } catch (error) {
            console.error("Failed to load PO Short Close records:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [ORG_ID, BRANCH_ID]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleEdit = (row) => {
        // Pass the full row data for editing
        onEdit(row);
    };

    const columns = [
        {
            key: "shortCloseNo",
            label: "Short Close No.",
            accessor: "shortCloseNo",
            type: "text",
            noWrap: true,
        },
        {
            key: "plantId",
            label: "Plant ID",
            accessor: "plantId",
            type: "text",
        },
        {
            key: "supplierCode",
            label: "Supplier Code",
            accessor: "supplierCode",
            type: "text",
            noWrap: true,
        },
        {
            key: "supplierName",
            label: "Supplier Name",
            accessor: "supplierName",
            type: "text",
        },
        {
            key: "poNo",
            label: "PO/Del.Sch.No",
            accessor: "poNo",
            type: "text",
            noWrap: true,
        },
        {
            key: "shortCloseDate",
            label: "Short Close Date",
            accessor: "shortCloseDate",
            type: "text",
            noWrap: true,
        },
        {
            key: "totalPendingQty",
            label: "Total Pending Qty",
            accessor: "totalPendingQty",
            type: "text",
            align: "right",
        },
        {
            key: "active",
            label: "Status",
            accessor: "active",
            type: "status",
            statusVariants: {
                true: {
                    label: "Active",
                    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                },
                false: {
                    label: "Inactive",
                    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
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
        "shortCloseNo",
        "plantId",
        "supplierCode",
        "supplierName",
        "poNo",
    ];

    const filterOptions = [
        {
            value: "all",
            label: "All",
            field: null,
        },
        {
            value: "pending",
            label: "Pending",
            field: "orderStatus",
            filterValue: "pending",
            activeValue: "Pending",
        },
        {
            value: "approved",
            label: "Approved",
            field: "orderStatus",
            filterValue: "approved",
            activeValue: "Approved",
        },
        {
            value: "closed",
            label: "Closed",
            field: "orderStatus",
            filterValue: "closed",
            activeValue: "Closed",
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
            title="PO/Delv.Sch. Shortclose"
            data={data}
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
            emptyMessage="No PO Short Close records found"
            loadingMessage="Loading PO Short Close records..."
            enableRefresh={true}
            onRefresh={loadData}
            enableExport={true}
            exportFileName="PO_Short_Close"
        />
    );
};

export default PoShortCloseListView;