const { AllAdminRoles } = require("../constants/roles");

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Role not allowed" });
    }
    next();
  };
};

const authorizeDivisions = (...allowedDivisions) => {
  return (req, res, next) => {
    const { role, division } = req.user;
    if (role === "ADMIN") return next();

    const divisionList = Array.isArray(division) ? division : [division];
    if (!divisionList.some((d) => allowedDivisions.includes(d))) {
      return res.status(403).json({
        message: `Forbidden: Only for divisions: ${allowedDivisions.join(
          ", "
        )}`,
      });
    }
    next();
  };
};

const authorizeAccess = ({ roles = [], divisions = [], institutions = [] }) => {
  return (req, res, next) => {
    const { role, division, institution } = req.user;

    const roleOk = roles.length === 0 || roles.includes(role);
    const divisionList = Array.isArray(division) ? division : [division];
    const divisionOk =
      divisions.length === 0 || divisionList.some((d) => divisions.includes(d));
    const institutionOk =
      institutions.length === 0 || institutions.includes(institution);

    if (!roleOk || !divisionOk || !institutionOk) {
      return res.status(403).json({
        message: `Access denied for role ${role}, division ${division}, institution ${institution}`,
      });
    }

    next();
  };
};

const authorizeInstitution = (...allowedInstitutions) => {
  return (req, res, next) => {
    if (!req.user || !allowedInstitutions.includes(req.user.institution)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Institution not allowed" });
    }
    next();
  };
};

const isAdmin = (req, res, next) => {
  if (req.user && AllAdminRoles.includes(req.user.role)) return next();
  return res.status(403).json({ message: "Admins only" });
};

const isProjectOfficer = (req, res, next) => {
  if (req.user?.role === "PO") return next();
  return res.status(403).json({ message: "Only for Project Officer (PO)" });
};

const isSuperAdmin = (req, res, next) => {
  if (req.user?.role === "ADMIN") return next();
  return res.status(403).json({ message: "Access denied: Super Admin only" });
};

const isBMCAdmin = (req, res, next) => {
  if (req.user?.role === "BMC_ADMIN") return next();
  return res.status(403).json({ message: "Access denied: BMC Admin only" });
};

module.exports = {
  authorizeRoles,
  authorizeDivisions,
  authorizeInstitution,
  authorizeAccess,
  isAdmin,
  isProjectOfficer,
  isSuperAdmin,
  isBMCAdmin,
};
