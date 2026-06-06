import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

const RFQForm = () => (
  <form className="form-grid">
    <Input label="RFQ title" />
    <Textarea label="Product or service details" />
    <Input label="Deadline" type="date" />
    <Button type="submit">Save RFQ</Button>
  </form>
);

export default RFQForm;

