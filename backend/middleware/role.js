const roleHierarchy = {
  user: 1,
  admin: 2,
  superadmin: 3
};

exports.requireRole = (requiredRole) => {
  return (req, res, next) => {
    console.log(req.user);
    
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "user role not found" });
    }

    const userLevel = roleHierarchy[req.user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    next();
  };
};
