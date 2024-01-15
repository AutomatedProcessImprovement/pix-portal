import { useEffect, useState } from "react";
import type { Asset } from "~/services/assets";
import type { ProcessingRequest } from "~/services/processing_requests";
import type { ProcessingType } from "~/shared/processing_type";
import InputAssets from "./InputAssets";
import OutputAssets from "./OutputAssets";
import ProcessingSetup from "./ProcessingSetup";
import { AssetsContext, SelectedAssetsContext } from "./contexts";
import { useActionData } from "@remix-run/react";
import type { action } from "../route";

export default function ProcessingApp({
  assets,
  processingType,
  processingRequests,
}: {
  assets: Asset[];
  processingType: ProcessingType;
  processingRequests: ProcessingRequest[];
}) {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    setSelectedAssets([]);
  }, [processingType, actionData?.shouldResetSelectedAssets]);

  return (
    <AssetsContext.Provider value={assets}>
      <SelectedAssetsContext.Provider value={selectedAssets}>
        <InputAssets setSelectedAssets={setSelectedAssets} />
        <ProcessingSetup processingType={processingType} />
        <OutputAssets processingRequests={processingRequests} />
      </SelectedAssetsContext.Provider>
    </AssetsContext.Provider>
  );
}
