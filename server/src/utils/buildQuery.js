const buildRegexQuery = (fields, search) => {
  if (!search) return {};

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: search, $options: 'i' }
    }))
  };
};

module.exports = { buildRegexQuery };

