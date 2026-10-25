export function validate(schema) {
  return (req, _res, next) => {
    try { req.validated = schema.parse(req.body); next(); }
    catch (error) { next(error); }
  };
}

export function validateParams(schema) {
  return (req, _res, next) => {
    try { schema.parse(req.params); next(); }
    catch (error) { next(error); }
  };
}
