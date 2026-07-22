import { RegisterPhysicalDatasetWizard } from './RegisterPhysicalDatasetWizard';

/** Producer workspace entry for Register Physical Dataset (SCRUM-10). */
export function ProducerPage() {
  return (
    <div className="producer-page">
      <RegisterPhysicalDatasetWizard open />
    </div>
  );
}
