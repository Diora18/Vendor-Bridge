const EmptyState = ({ title = 'Nothing here yet', action }) => {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {action}
    </div>
  );
};

export default EmptyState;

