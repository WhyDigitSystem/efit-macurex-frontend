import { useState } from "react";
import Roles from "./Roles";
import Responsibilities from "./Responsibilities";

const RolesAndResponsibilitySetup = () => {
    const [activeTab, setActiveTab] = useState("roles");

    return (
        <div className="p-2 max-w-7xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Roles & Responsibilities
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
                {/* Tabs */}
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab("roles")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "roles"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Roles
                    </button>
                    <button
                        onClick={() => setActiveTab("responsibilities")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "responsibilities"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Responsibilities
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mt-2">
                    {activeTab === "roles" && <Roles />}
                    {activeTab === "responsibilities" && <Responsibilities />}
                </div>
            </div>
        </div>
    );
};

export default RolesAndResponsibilitySetup;