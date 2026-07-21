import { API_ENDPOINTS } from '../../../api/endpoints';
import { httpGet, httpPost } from '../../../app/api/httpClient';
import type { ApiResult } from '../../../app/api/api.types';
import type {
  WorkflowApproveResponse,
  WorkflowBoardResponse,
  WorkflowDeclineResponse,
} from './workflow.types';

export const WORKFLOW_BOARD_PATH = API_ENDPOINTS.workflowBoard.path;
export const WORKFLOW_APPROVE_PATH = API_ENDPOINTS.workflowApprove.path;
export const WORKFLOW_DECLINE_PATH = API_ENDPOINTS.workflowDecline.path;

export function fetchWorkflowBoard(options?: {
  signal?: AbortSignal;
}): Promise<ApiResult<WorkflowBoardResponse>> {
  return httpGet<WorkflowBoardResponse>(WORKFLOW_BOARD_PATH, {
    signal: options?.signal,
    resource: API_ENDPOINTS.workflowBoard.id,
  });
}

export function approveWorkflowSubscription(
  requestId: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<WorkflowApproveResponse>> {
  return httpPost<WorkflowApproveResponse>(WORKFLOW_APPROVE_PATH, {
    body: { requestId },
    signal: options?.signal,
    resource: API_ENDPOINTS.workflowApprove.id,
  });
}

export function declineWorkflowSubscription(
  requestId: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResult<WorkflowDeclineResponse>> {
  return httpPost<WorkflowDeclineResponse>(WORKFLOW_DECLINE_PATH, {
    body: { requestId },
    signal: options?.signal,
    resource: API_ENDPOINTS.workflowDecline.id,
  });
}
