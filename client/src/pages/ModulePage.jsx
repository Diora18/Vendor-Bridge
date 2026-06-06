import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';

const ModulePage = ({ title, subtitle, primaryAction = 'Create new', children }) => {
  return (
    <section>
      <PageHeader title={title} subtitle={subtitle} actions={<Button>{primaryAction}</Button>} />
      {children || (
        <div className="module-grid">
          <div className="panel">
            <h2>Work queue</h2>
            <p>This area is ready for tables, filters, and workflow actions.</p>
          </div>
          <div className="panel">
            <h2>Next build step</h2>
            <p>Connect this page to its service file and replace this panel with module-specific data.</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default ModulePage;

