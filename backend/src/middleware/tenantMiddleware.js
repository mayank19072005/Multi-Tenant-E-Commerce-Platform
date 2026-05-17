const attachTenant = (req, res, next) => {

  if (req.user.role === 'vendor') {
    req.tenant_id = req.user.tenant_id;
  }

  next();
};

module.exports = {
  attachTenant
};
