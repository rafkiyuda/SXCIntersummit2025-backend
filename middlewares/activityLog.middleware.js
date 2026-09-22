const { logActivity } = require("../admin/admin.service");

function activityLogger(req, res, next) {
  // Event 'finish' akan dipicu ketika respons telah dikirim sepenuhnya ke klien
  res.on("finish", () => {
    // Memastikan hanya login jika ada data di res.locals.activityLog
    if (res.locals.activityLog) {
      const { activity } = res.locals.activityLog;
      const staffId = req.user.id; // Asumsikan staffId ada di req.user setelah autentikasi
      const status =
        res.statusCode >= 200 && res.statusCode < 300 ? "success" : "failed";

      // Pastikan ada staffId sebelum logging
      if (staffId) {
        logActivity({
          staffId,
          activity,
          status,
        });
      } else {
        console.warn(
          "⚠️ Cannot log activity: adminId not found in request (authentication missing or failed)."
        );
      }
    }
  });
  next(); // Lanjutkan ke middleware berikutnya atau route handler
}

module.exports = { activityLogger };
