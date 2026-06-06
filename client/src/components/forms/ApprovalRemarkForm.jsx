import Textarea from '../common/Textarea';
import Button from '../common/Button';

const ApprovalRemarkForm = () => (
  <form className="form-grid">
    <Textarea label="Approval remarks" />
    <div className="actions">
      <Button>Approve</Button>
      <Button variant="danger">Reject</Button>
    </div>
  </form>
);

export default ApprovalRemarkForm;

