import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import screensAPI from "../../../api/screensAPI";

const ScreenNamesList = ({ onAddNew, onEdit, onBack }) => {
    const [screenData, setScreenData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orgId] = useState(localStorage.getItem("orgId") || "1000000006");

    const loadScreens = async () => {
        setLoading(true);
        try {
            const response = await screensAPI.getScreens(orgId);
            console.log("API Response:", response);

            let screenList = [];

            // Handle different response formats
            if (Array.isArray(response)) {
                screenList = response;
            } else if (response?.paramObjectsMap?.screenNamesVO) {
                screenList = response.paramObjectsMap.screenNamesVO;
            } else if (response?.data) {
                screenList = response.data;
            } else {
                screenList = [];
            }

            const data = screenList.map((item) => ({
                id: item.id,
                screenCode: item.screenCode || "",
                screenName: item.screenName || "",
                active: item.active === "Active" ? true : (item.active ?? true),
            }));
            data.sort((a, b) => b.id - a.id);
            setScreenData(data);
        } catch (error) {
            console.error("Error loading screens:", error);
            setScreenData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadScreens();
    }, []);

    const handleEdit = (screen) => {
        onEdit(screen);
    };

    const columns = [
        {
            key: "screenCode",
            label: "Screen Code",
            accessor: "screenCode",
            type: "text",
            noWrap: true,
        },
        {
            key: "screenName",
            label: "Screen Name",
            accessor: "screenName",
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
        "screenCode",
        "screenName",
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
            title="Screen Names"
            data={screenData}
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
            emptyMessage="No Screens found"
            loadingMessage="Loading Screens..."
            enableRefresh={true}
            onRefresh={loadScreens}
            enableExport={true}
            exportFileName="Screen_Names"
        />
    );
};

export default ScreenNamesList;