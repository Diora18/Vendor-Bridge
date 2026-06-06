import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ title, children, onConfirm, onClose }) => {
  return (
    <Modal title={title} onClose={onClose}>
      <div>{children}</div>
      <div className="actions">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

