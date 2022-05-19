module.exports = {
  catcher: (controller) => (req, res, next) => controller(req, res).catch(next)
};
