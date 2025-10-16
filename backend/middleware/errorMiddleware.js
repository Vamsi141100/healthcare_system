const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  console.error("ERROR => ", {
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { errorHandler };