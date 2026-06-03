function sendSuccess(res, statusCode, payload = {}) {
  return res.status(statusCode).json({
    status: "success",
    ...payload
  });
}

module.exports = {
  sendSuccess
};
