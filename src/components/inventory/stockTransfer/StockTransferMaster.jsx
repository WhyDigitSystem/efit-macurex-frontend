import { useState, useCallback } from "react";
import StockTransferList from "./StockTransferList";
import StockTransferForm from "./StockTransferForm";
import stockTransferAPI from "../../../api/Inventory/stockTransferAPI";
import { toast } from "../../../utils/toast";

const StockTransferMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = useCallback(async (row) => {
    try {
      const response = await stockTransferAPI.getStockTransferById(row.id);
      console.log("Get By ID Response:", response);

      let freshData = response?.paramObjectsMap?.stockTransferResponseVO ||
        response?.paramObjectsMap?.stockTransferVO ||
        response;

      if (!freshData) {
        toast.error("Failed to load Stock Transfer details");
        return;
      }

      // Map the data to match the form's expected structure
      const mappedData = {
        id: freshData.id,
        header: {
          fromPlantId: freshData.branch?.id || "",
          stockTransferNo: freshData.docId || "",
          toPlant: freshData.toBranch?.id || "",
          stockTransferDate: freshData.docDate || "",
          belongsTo: freshData.belongsTo || "",
          fromLocation: freshData.fromLocation?.id || "",
          toLocation: freshData.toLocation?.id || "",
          reason: freshData.reason || "",
        },
        summary: {
          narration: freshData.narration || "",
        },
        binTransferDetails: (freshData.stockTransferDetailsResponseDTO || []).map((item) => ({
          itemCode: item.item?.id || "",
          itemmastid: item.item?.id || "",
          ItemIDn: item.item?.id || "",
          itemDescription: item.item?.itemDescription || "",
          unit: item.unit?.id || "", // Use unit.id for the unit ID
          unitmasterId: item.unit?.id || "", // Use unit.id for unitmasterId
          unitLabel: item.unit?.unitId || "", // Store the unit label for display
          availableQty: item.availableQty || "",
          qty: item.qty || "",
          rate: item.rate || "",
        })),
        active: freshData.active === "Active",
      };

      setEditData(mappedData);
      setScreen("form");
    } catch (error) {
      console.error("Failed to fetch Stock Transfer for edit:", error);
      toast.error("Failed to load Stock Transfer details");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setScreen("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSave = async (payload) => {
    try {
      setRefreshTrigger((prev) => prev + 1);
      handleBack();
    } catch (error) {
      console.error("Error saving stock transfer:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <StockTransferList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <StockTransferForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default StockTransferMaster;