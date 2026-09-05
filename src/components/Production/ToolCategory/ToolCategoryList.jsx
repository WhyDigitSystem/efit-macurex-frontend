import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { useToast } from "../../Toast/ToastContext";
import toolCategoryAPI from "../../../api/Production/toolCategoryAPI";

const ToolCategoryList = ({ onAddNew, onEdit, refreshTrigger, onBack }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const ORG_ID = localStorage.getItem("orgId");

    const loadRecords = useCallback(async () => {
        if (!ORG_ID) {
            console.warn("Missing orgId");
            return;
        }

        try {
            setLoading(true);
            const response = await toolCategoryAPI.getToolCategories(ORG_ID);

            console.log("Tool Category API Response:", response);

            // Extract the data from the response structure
            let data = [];
            if (response?.paramObjectsMap?.toolCategoryResponseVO) {
                data = response.paramObjectsMap.toolCategoryResponseVO;
            } else if (response?.paramObjectsMap?.toolCategories) {
                data = response.paramObjectsMap.toolCategories;
            } else if (Array.isArray(response)) {
                data = response;
            } else if (response?.data?.paramObjectsMap?.toolCategoryResponseVO) {
                data = response.data.paramObjectsMap.toolCategoryResponseVO;
            }

            // Transform data for display
            const transformedData = data.map((item) => ({
                id: item.id,
                applicableFor: item.apllicableFor || item.applicableFor || "",
                categories: item.toolCategoryDetailResponseDTO?.length ||
                    item.categories?.length || 0,
                active: item.active === true || item.active === "Active" ? "Active" : "Inactive",
                _rawData: item,
            }));

            // Sort by ID descending (newest first)
            transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));
            setRecords(transformedData);
        } catch (error) {
            console.error("Failed to load tool categories:", error);
            setRecords([]);
            addToast("Failed to fetch Tool Categories", "error");
        } finally {
            setLoading(false);
        }
    }, [ORG_ID, addToast]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords, refreshTrigger]);

    const handleEdit = (record) => {
        if (onEdit) {
            onEdit(record._rawData || record);
        }
    };

    const columns = [
        {
            key: "applicableFor",
            label: "Applicable For",
            accessor: "applicableFor",
            type: "text",
        },
        {
            key: "categories",
            label: "No. of Categories",
            accessor: "categories",
            type: "text",
        },
        {
            key: "active",
            label: "Status",
            accessor: "active",
            type: "status",
            statusVariants: {
                Active: {
                    label: "Active",
                    className:
                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                },
                Inactive: {
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

    const searchFields = ["applicableFor"];

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

    return (
        <CommonListViewTable
            title="Tool Category"
            data={records}
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
            emptyMessage="No Tool Categories found"
            loadingMessage="Loading Tool Categories..."
            enableRefresh={true}
            onRefresh={loadRecords}
            enableExport={true}
            exportFileName="ToolCategories"
        />
    );
};

export default ToolCategoryList;