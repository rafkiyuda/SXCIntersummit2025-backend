const service = require("./itA.service");
const { hashPassword } = require("../../utils/hash");
const { validatePassword } = require("../../utils/password");

// === STAFF ===
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role, division } = req.body;
    const existingUser = await service.findUserByEmail(email);
    const existingStaff = await service.findStaffByEmail(email);
    if (existingUser || existingStaff) {
      return res
        .status(400)
        .json({ message: "Create staff failed: email already exists" });
    }
    const passwordError = await validatePassword(password);
    if (passwordError.valid == false) {
      return res.status(400).json({ message: passwordError.message });
    }
    const hashed = await hashPassword(password);
    const searchDivision = await service.findDivision(division);
    const divisionId = searchDivision.id;

    const staff = await service.createStaff({
      name,
      email,
      password: hashed,
      role,
      divisionId: divisionId,
    });
    res.locals.activityLog = {
      activity: `${req.user.id} Membuat Admin baru dengan email ${email}`,
    };
    res.status(201).json({ message: "Staff berhasil dibuat", staff });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal Membuat Admin baru`,
    };
    console.error("Register error:", err);
    res
      .status(500)
      .json({ message: "Gagal membuat staff", error: err.message });
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const staffList = await service.getAllStaff(); //(+page, +limit);;
    res.json(staffList);
  } catch (err) {
    console.error("get all staff error:", err);
    res.status(500).json({ message: "Gagal mengambil data staff" });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    // Jika ada password, hash terlebih dahulu
    if (req.body.password) {
      const passwordError = await validatePassword(req.body.password);
      if (passwordError.valid == false) {
        return res.status(400).json({ message: passwordError.message });
      }
      const hashed = await hashPassword(req.body.password);
      req.body.password = hashed;
    }

    // Jika ada division dan perlu konversi, lakukan konversi di sini
    if (req.body.division) {
      // Misalnya perlu validasi atau ambil data division berdasarkan ID
      const division = await service.findDivision(req.body.division);
      if (!division)
        return res.status(400).json({ message: "Division tidak ditemukan" });
      // Bisa juga set divisionId yg valid atau modifikasi data sebelum update
      req.body.divisionId = division.id;
      delete req.body.division;
    }

    const updated = await service.updateStaff(+req.params.id, req.body);

    res.locals.activityLog = {
      activity: `${req.user.id} Mengubah data staff dengan ID ${req.params.id}`,
    };
    res.status(200).json({ message: "Staff berhasil diperbarui", updated });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal Mengubah data staff dengan ID ${req.params.id}`,
    };
    console.error("update staff error:", err);
    res.status(500).json({ message: "Gagal memperbarui staff" });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const deleted = await service.deleteStaff(+req.params.id);
    res.locals.activityLog = {
      activity: `${req.user.id} Menghapus data staff dengan ID ${req.params.id}`,
    };
    res.status(200).json({ message: "Staff berhasil dihapus", deleted });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal Menghapus data staff dengan ID ${req.params.id}`,
    };
    console.error("delete staff error:", err);
    res.status(500).json({ message: "Gagal menghapus staff" });
  }
};

// === REFERRAL ===
exports.createReferral = async (req, res) => {
  try {
    const oldReferral = await service.findReferral(req.body.code);
    if (oldReferral) {
      res.status(400).json({ message: "Referral code tidak boleh sama" });
    }

    // Jika ada program dan perlu konversi, lakukan konversi di sini
    if (req.body.program) {
      const programs = await service.findProgram(req.body.program);
      if (!programs || programs.length === 0)
        return res.status(400).json({ message: "Program tidak ditemukan" });
      req.body.programIds = programs.map((p) => p.id);
      delete req.body.program;
    }

    const referral = await service.createReferral(req.body);
    res.locals.activityLog = {
      activity: `${req.user.id} Membuat referral code dengan kode ${req.body.code}`,
    };
    res
      .status(201)
      .json({ message: "Referral code berhasil dibuat", referral });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal membuat referral code dengan kode ${req.body.code}`,
    };
    console.error("create referral error:", err);
    res
      .status(500)
      .json({ message: "Gagal membuat referral", error: err.message });
  }
};

exports.getAllReferral = async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const referrals = await service.getAllReferral(); //(+page, +limit);;
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil referral code" });
  }
};

exports.updateReferral = async (req, res) => {
  try {
    if (req.body.program) {
      const programs = await service.findProgram(req.body.program);
      if (!programs || programs.length === 0)
        return res.status(400).json({ message: "Program tidak ditemukan" });
      req.body.programIds = programs.map((p) => p.id);
      delete req.body.program;
    }

    const updated = await service.updateReferral(+req.params.id, req.body);
    res.locals.activityLog = {
      activity: `${req.user.id} Mengubah referral code dengan ID ${req.params.id}`,
    };
    res.status(200).json({ message: "Referral berhasil diperbarui", updated });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal mengubah referral code dengan ID ${req.params.id}`,
    };
    console.error("update referral error:", err);
    res.status(500).json({ message: "Gagal memperbarui referral" });
  }
};

exports.deleteReferral = async (req, res) => {
  try {
    const deleted = await service.deleteReferral(+req.params.id);
    res.locals.activityLog = {
      activity: `${req.user.id} Menghapus referral code dengan ID ${req.params.id}`,
    };
    res.status(200).json({ message: "Referral berhasil dihapus", deleted });
  } catch (err) {
    res.locals.activityLog = {
      activity: `${req.user.id} Gagal menghapus referral code dengan ID ${req.params.id}`,
    };
    console.error("delete referral error:", err);
    res.status(500).json({ message: "Gagal menghapus referral" });
  }
};

exports.totalUsed = async (req, res) => {
  try {
    const total = await service.getTotalUserReferral();
    res.status(200).json({ total });
  } catch (err) {
    console.error("Error getting total used referral:", err);
    res
      .status(500)
      .json({ message: "Gagal mendapatkan total penggunaan referral" });
  }
};
// ===== ACTIVITY LOG ====
exports.getActivityLog = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const activityLog = await service.getAllStaffActivity(); //(+page, +limit);;
    res.json(activityLog);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil activity log" });
  }
};
