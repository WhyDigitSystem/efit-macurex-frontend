import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import servicesAccountingAPI from "../../../api/servicesAccountingAPI";

const ServiceAccountingList = ({ onAddNew, onEdit, onBack }) => {
    const [itemData, setItemData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadItems = async () => {
        setLoading(true);
        setError(null);

        try {
            const orgId = localStorage.getItem("orgId");
            const branchId = localStorage.getItem("branchId");

            if (!orgId || !branchId) {
                throw new Error("Organization ID or Branch ID not found");
            }

            const response = await servicesAccountingAPI.getAll(branchId, orgId);
            console.log("Full API Response:", response);

            // Extract the service list from the response
            const serviceList = response?.paramObjectsMap?.serviceAccMasterVO || [];
            console.log("Service List:", serviceList);

            if (!serviceList || serviceList.length === 0) {
                console.log("No data found in serviceList");
                setItemData([]);
                setLoading(false);
                return;
            }

            // Transform the data to match the table structure
            const transformedData = serviceList.map(item => {
                console.log("Processing item:", item);

                return {
                    id: item.id || 0,
                    serviceName: item.serviceName || "",
                    serviceDescription: item.serviceDescription || "",
                    // Fix: Get HSN code from itemHsn object
                    hsnCode: item.itemHsn?.hsnCode || item.hsnCode || item.hsnSacCode || "",
                    // Fix: Handle active status properly
                    active: item.active === true || item.active === "Active" || item.active === "Yes",
                    // Keep original data for reference
                    _originalData: item
                };
            });

            console.log("Transformed Data:", transformedData);

            // Sort by ID descending (newest first)
            transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));

            setItemData(transformedData);
        } catch (error) {
            console.error("Error loading Services:", error);
            setError(error.message || "Failed to load Services");
            setItemData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleEdit = (item) => {
        // Pass the full original data for editing
        onEdit(item._originalData || item);
    };

    const columns = [
        {
            key: "serviceName",
            label: "Service Name",
            accessor: "serviceName",
            type: "text",
            noWrap: true,
        },
        {
            key: "serviceDescription",
            label: "Service Description",
            accessor: "serviceDescription",
            type: "text",
        },
        {
            key: "hsnCode",
            label: "HSN/SAC Code",
            accessor: "hsnCode",
            type: "text",
        },
        // {
        //     key: "active",
        //     label: "Active",
        //     accessor: "active",
        //     type: "boolean",
        //     render: (value) => (
        //         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value
        //                 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        //                 : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        //             }`}>
        //             {value ? 'Yes' : 'No'}
        //         </span>
        //     ),
        // },
        {
            key: "actions",
            label: "Actions",
            type: "actions",
            align: "center",
            width: "90px",
        },
    ];

    const searchFields = [
        "serviceName",
        "serviceDescription",
        "hsnCode",
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
            filterValue: "active",
            activeValue: true,
        },
        {
            value: "inactive",
            label: "Inactive",
            field: "active",
            filterValue: "inactive",
            activeValue: true,
        },
    ];

    return (
        <CommonListViewTable
            title="Services Accounting Master"
            subtitle="Manage Service Accounting Records"
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
            emptyMessage={error || "No Services found"}
            loadingMessage="Loading Services..."
            enableRefresh={true}
            onRefresh={loadItems}
            enableExport={true}
            exportFileName="ServiceAccounting"
        />
    );
};

export default ServiceAccountingList;