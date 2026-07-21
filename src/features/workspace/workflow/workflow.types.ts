export type WorkflowSubscriptionRequest = {
  id: string;
  consumer: string;
  dataset: string;
  datasetId: string;
  status: string;
  age: string;
};

export type WorkflowProposedElement = {
  id: string;
  name: string;
  dataset: string;
  by: string;
  status: string;
  age: string;
};

export type WorkflowUnmappedColumn = {
  id: string;
  column: string;
  dataset: string;
  by: string;
  status: string;
  age: string;
};

export type WorkflowBoardResponse = {
  clearedThisWeek: number;
  subscriptionRequests: WorkflowSubscriptionRequest[];
  proposedElements: WorkflowProposedElement[];
  unmappedColumns: WorkflowUnmappedColumn[];
};

export type WorkflowApproveResponse = {
  requestId: string;
  consumer: string;
  contractId: string;
  subscriptionId: string;
  status: 'Active';
};

export type WorkflowDeclineResponse = {
  requestId: string;
  status: 'Declined';
};

/** Local UI state after approve — keeps the card in place with minted ids. */
export type WorkflowApprovedCard = {
  requestId: string;
  consumer: string;
  contractId: string;
  subscriptionId: string;
};
