import Input from '../common/Input';
import Button from '../common/Button';

const VendorForm = () => (
  <form className="form-grid">
    <Input label="Company name" />
    <Input label="Contact email" type="email" />
    <Input label="Category" />
    <Input label="GST number" />
    <Button type="submit">Save vendor</Button>
  </form>
);

export default VendorForm;

