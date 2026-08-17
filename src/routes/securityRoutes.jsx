import GateInward from "../components/Security/GateInward/GateInward";
import GateOutward from "../components/Security/GateOutward/GateOutward";
import SecurityList from "../components/Security/SecurityList";

const securityRoutes = [
  {
    path: "/Security",
    label: "Security",
    keywords: ["Security", "Secu"],
    element: <SecurityList />,
  },
  {
    path: "/gateinwardentry",
    label: "GateInward",
    keywords: ["Gate Inward", "GateIn"],
    element: <GateInward />,
  },
  {
    path: "/gateoutwardentry",
    label: "GateOutward",
    keywords: ["Gate Outward", "GateOut"],
    keywords: ["Security", "Secu"],
    element: <GateOutward />,
  },
];

export default securityRoutes;
