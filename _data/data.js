module.exports = function () {
  return {
    functions_host: process.env.FUNCTIONS_HOST || "",
  };
};
