const { sendSuccess } = require("../utils/httpResponse");

function getHealth(req, res) {
  sendSuccess(res, 200, {
    status: "ok",
    service: "habit-flow-api",
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getHealth
};
