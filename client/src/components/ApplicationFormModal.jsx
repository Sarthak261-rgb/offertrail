import toast from 'react-hot-toast';
import { useCreateApplication, useUpdateApplication } from '../hooks/useApplications.js';
import { toFormValues } from '../utils/applicationForm.js';
import { ApplicationForm } from './ApplicationForm.jsx';
import { Modal } from './Modal.jsx';

/** Create mode when `application` is omitted, edit mode otherwise. */
export function ApplicationFormModal({ open, onClose, application, defaultStatus }) {
  const create = useCreateApplication();
  const update = useUpdateApplication();
  const isEdit = Boolean(application);

  async function handleSubmit(values) {
    if (isEdit) {
      await update.mutateAsync({ id: application._id, changes: values });
      toast.success('Application updated');
    } else {
      await create.mutateAsync(values);
      toast.success(`Added ${values.company}`);
    }
    onClose();
  }

  const initialValues = toFormValues(
    application ?? (defaultStatus ? { status: defaultStatus } : {}),
  );

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit application' : 'New application'}>
      <ApplicationForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel={isEdit ? 'Save changes' : 'Add application'}
      />
    </Modal>
  );
}
