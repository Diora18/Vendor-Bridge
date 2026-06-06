import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

const QuotationForm = () => (
  <form className="form-grid">
    <Input label="Total amount" type="number" />
    <Input label="Delivery timeline" />
    <Textarea label="Notes" />
    <Button type="submit">Submit quotation</Button>
  </form>
);

export default QuotationForm;

