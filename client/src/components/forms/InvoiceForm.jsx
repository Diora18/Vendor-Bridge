import Input from '../common/Input';
import Button from '../common/Button';

const InvoiceForm = () => (
  <form className="form-grid">
    <Input label="Purchase order ID" />
    <Button type="submit">Generate invoice</Button>
  </form>
);

export default InvoiceForm;

