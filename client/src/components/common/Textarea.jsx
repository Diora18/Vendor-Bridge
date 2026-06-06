const Textarea = ({ label, ...props }) => {
  return (
    <label className="field">
      {label && <span>{label}</span>}
      <textarea {...props} />
    </label>
  );
};

export default Textarea;

