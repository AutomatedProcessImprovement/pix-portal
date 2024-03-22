import { Link } from "@remix-run/react";
import { Suspense, useCallback, useContext, useEffect, useState } from "react";
import type { ToastOptions } from "react-hot-toast";
import toast from "react-hot-toast";
import { UserContext } from "~/routes/contexts";
import { AssetType } from "~/services/assets";
import {
  ProcessingRequestStatus,
  ProcessingRequestType,
  getProcessingRequest,
  type ProcessingRequest,
} from "~/services/processing_requests";
import { parseDate } from "~/shared/utils";
import { AssetCard } from "./AssetCard";
import { useAuthRefreshRequest } from "../hooks/useAutoRefreshRequest";

export function ProcessingRequestCard({ request }: { request: ProcessingRequest }) {
  // polling of running requests to update the status

  const request_ = useAuthRefreshRequest(request);

  function getDuration(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = endDate.getTime() - startDate.getTime();
    return duration;
  }

  function formatDuration(duration: number) {
    return new Date(duration).toISOString().substr(11, 8);
  }

  function formattedDuration() {
    if (!request_) return "";
    return request_.end_time ? formatDuration(getDuration(request_.creation_time, request_.end_time)) : "";
  }

  function textColorByStatus(status: ProcessingRequestStatus) {
    switch (status) {
      case ProcessingRequestStatus.CREATED:
        return "text-blue-600";
      case ProcessingRequestStatus.RUNNING:
        return "text-yellow-600 animate-pulse";
      case ProcessingRequestStatus.FINISHED:
        return "text-green-600";
      case ProcessingRequestStatus.FAILED:
        return "text-red-600";
      case ProcessingRequestStatus.CANCELLED:
        return "text-gray-600";
      default:
        return "";
    }
  }

  const simulationAssetId = useCallback(() => {
    if (!request_) return null;
    const models = request_.output_assets.filter((a) => a.type === AssetType.SIMULATION_MODEL);
    if (models.length > 0) return models[0].id;
    return null;
  }, [request_]);

  const [creationDate, setCreationDate] = useState(request_?.creation_time);
  useEffect(() => {
    if (!request_) return;
    setCreationDate(parseDate(request_.creation_time));
  }, [request_]);

  if (!request_) return <></>;
  return (
    <div
      className={`flex flex-col space-y-2 rounded-lg p-2 border-2 break-words tracking-normal text-sm text-slate-800 bg-slate-100`}
      data-processingrequestid={request_.id}
    >
      <div>
        <p>Job started at {creationDate}</p>
        {formattedDuration() ? <p>Duration {formattedDuration()}</p> : <></>}
        <p>
          Status: <span className={`font-semibold ${textColorByStatus(request_.status)}`}>{request_.status}</span>
        </p>
        {request_.status === ProcessingRequestStatus.FAILED && request_.message && request_.message.length > 0 && (
          <details className="break-all">
            <summary className="cursor-pointer w-fit">Details</summary>
            <p className="text-slate-500 text-xs leading-relaxed">{request_.message}</p>
          </details>
        )}
      </div>
      {request_.type === ProcessingRequestType.WAITING_TIME_ANALYSIS_KRONOS &&
        request_.status === ProcessingRequestStatus.FINISHED && (
          <Link to={`/kronos/results/${request_.id}`} target="_blank" className="shrink w-fit">
            Open in Kronos
          </Link>
        )}
      {request_.type === ProcessingRequestType.SIMULATION_PROSIMOS &&
        request_.status === ProcessingRequestStatus.FINISHED && (
          <Link to={`/prosimos/results/${request_.id}`} target="_blank" className="shrink w-fit">
            Show simulation statistics
          </Link>
        )}
      {request_.type === ProcessingRequestType.SIMULATION_MODEL_OPTIMIZATION_OPTIMOS &&
        request_.status === ProcessingRequestStatus.RUNNING &&
        !!request.output_assets.length && (
          <Link to={`/optimos/results/${request_.id}`} target="_blank" className="shrink w-fit">
            Show (live) results
          </Link>
        )}
      {request_.type === ProcessingRequestType.SIMULATION_MODEL_OPTIMIZATION_OPTIMOS &&
        request_.status === ProcessingRequestStatus.FINISHED && (
          <Link to={`/optimos/results/${request_.id}`} target="_blank" className="shrink w-fit">
            Show results
          </Link>
        )}
      {request_.type === ProcessingRequestType.SIMULATION_MODEL_OPTIMIZATION_SIMOD &&
        request_.status === ProcessingRequestStatus.FINISHED &&
        simulationAssetId() && (
          <Link to={`/bpmn/${simulationAssetId()}`} target="_blank" className="shrink w-fit">
            Preview the model
          </Link>
        )}
      {request_.output_assets.length > 0 &&
        request_.output_assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} isActive={false} isRemoveAvailable={false} isInteractive={false} />
        ))}
    </div>
  );
}
