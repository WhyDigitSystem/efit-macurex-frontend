import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProformaInvoiceForm from "./ProformaInvoiceForm";
import ProformaInvoiceList from "./ProformaInvoiceList";
import proformaInvoiceAPI from "../../../api/Sales/proformaInvoiceAPI";
import { toast } from "../../../utils/toast";

const ProformaInvoice = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const addNew = () => {
    setEditData(null);
    setScreen("form");
  };

  // Pencil icon click -> fetch the record by id, then open the form
  const edit = useCallback(
    async (row) => {
      try {
        const fresh =
          (await proformaInvoiceAPI.getProformaInvoiceById(row.id)) || row;
        setEditData(fresh);
        setScreen("form");
      } catch (error) {
        console.error("Failed to fetch proforma invoice for edit:", error);
        toast.error("Failed to load Proforma Invoice details");
      }
    },
    [],
  );

  const handleBack = () => {
    setEditData(null);
    setScreen("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Sales module home.
  const handleNavigateHome = () => {
    navigate("/Sales");
  };

  return (
    <>
      {screen === "list" && (
        <ProformaInvoiceList
          onAddNew={addNew}
          onEdit={edit}
          onBack={handleNavigateHome}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <ProformaInvoiceForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default ProformaInvoice;