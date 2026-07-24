/**
 * Mock handlers for Catalogue → Logical Model / Glossary Terms / Lineage.
 * Kept in its own grouped file (not appended to workspace.handlers.ts) so this
 * feature's mock wiring can be found, changed, and eventually deleted as one unit,
 * independent of the console/bulkPde/bindColumns/workflow handlers.
 *
 * Mock latency controlled by src/api/mock/mockDelay.ts (default 0).
 */
import { delay, http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '../../endpoints';
import { getMockResponseDelay } from '../mockDelay';
import logicalModel from '../../../mocks/workspace/catalogue/logical-model.json';
import businessElements from '../../../mocks/workspace/catalogue/business-elements.json';
import glossaryTerms from '../../../mocks/workspace/catalogue/glossary-terms.json';
import lineageSummary from '../../../mocks/workspace/catalogue/lineage-summary.json';
import lineageDetails from '../../../mocks/workspace/catalogue/lineage-details.json';

export const CATALOGUE_LOGICAL_MODEL_URL = API_ENDPOINTS.catalogueLogicalModel.path;
export const CATALOGUE_BUSINESS_ELEMENTS_URL = API_ENDPOINTS.catalogueBusinessElements.path;
export const CATALOGUE_GLOSSARY_TERMS_URL = API_ENDPOINTS.catalogueGlossaryTerms.path;
export const CATALOGUE_LINEAGE_URL = API_ENDPOINTS.catalogueLineage.path;
export const CATALOGUE_LINEAGE_DETAILS_URL = API_ENDPOINTS.catalogueLineageDetails.path;

async function applyLatency() {
  const ms = getMockResponseDelay();
  if (ms > 0) await delay(ms);
}

export const catalogueHandlers = [
  http.get(`*${CATALOGUE_LOGICAL_MODEL_URL}`, async () => {
    await applyLatency();
    return HttpResponse.json(logicalModel);
  }),

  http.get(`*${CATALOGUE_BUSINESS_ELEMENTS_URL}`, async () => {
    await applyLatency();
    return HttpResponse.json(businessElements);
  }),

  http.get(`*${CATALOGUE_GLOSSARY_TERMS_URL}`, async () => {
    await applyLatency();
    return HttpResponse.json(glossaryTerms);
  }),

  http.get(`*${CATALOGUE_LINEAGE_URL}`, async () => {
    await applyLatency();
    return HttpResponse.json(lineageSummary);
  }),

  http.get(`*${CATALOGUE_LINEAGE_DETAILS_URL}`, async () => {
    await applyLatency();
    return HttpResponse.json(lineageDetails);
  }),
];
