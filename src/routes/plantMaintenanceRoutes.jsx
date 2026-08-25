import BreakdownAuthorizationMaster from "../components/plantMaintenance/BreakdownAuthorization/BreakdownAuthorizationMaster";
import MachineToolRectificationMaster from "../components/plantMaintenance/MachineToolRectification/MachineToolRectificationMaster ";
import MachineToolsScrapNoteMaster from "../components/plantMaintenance/MachineToolsScrapNote/MachineToolsScrapNoteMaster";
import MaintenanceServiceRequestMaster from "../components/plantMaintenance/MaintenanceServiceRequest/MaintenanceServiceRequestMaster";

const plantMaintenanceRoutes = [
  {
    path: "/machinetoolrectification",
    label: "Machine Tool Rectification",
    element: <MachineToolRectificationMaster />,
  },
  {
    path: "/authorizationforbreakdown",
    label: "Authorization for Breakdown",
    element: <BreakdownAuthorizationMaster />,
  },
  {
    path: "/machinetoolsscrapnote",
    label: "Machine Tool Scrap Note",
    element: <MachineToolsScrapNoteMaster />,
  },
  {
    path: "/maintenanceservicerequest",
    label: "Maintenance Service Request",
    element: <MaintenanceServiceRequestMaster />,
  },
];

export default plantMaintenanceRoutes;
