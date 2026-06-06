const Pagination = ({ page, onPrevious, onNext }) => {
  return (
    <div className="pagination">
      <button onClick={onPrevious}>Previous</button>
      <span>Page {page}</span>
      <button onClick={onNext}>Next</button>
    </div>
  );
};

export default Pagination;

