module.exports = {
  openapi: "3.0.0",
  info: {
    title: "StudentsxCEOs International Summit 2025 API",
    version: "1.0.0",
    description: "Dokumentasi REST API StudentsxCEOs International Summit 2025",
    contact: {
      name: "SxC International Summit IT Team",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development Server (Local)",
    },
    {
      url: "https://api.sxcintersummit.com",
      description: "Production Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Masukkan JWT Token pengguna atau staff",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT Token disimpan di HTTP cookie 'token'",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message details" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "John Doe" },
          email: { type: "string", format: "email", example: "johndoe@example.com" },
          password: { type: "string", minLength: 6, example: "password123" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "johndoe@example.com" },
          password: { type: "string", example: "password123" },
        },
      },
      VerifyOtpRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: { type: "string", format: "email", example: "johndoe@example.com" },
          otp: { type: "string", minLength: 6, maxLength: 6, example: "123456" },
        },
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "johndoe@example.com" },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "johndoe@example.com" },
          password: { type: "string", minLength: 6, example: "newpassword123" },
        },
      },
      ProfileUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "John Doe" },
          birthdate: { type: "string", format: "date", example: "2003-05-15" },
          domicile: { type: "string", example: "Jakarta" },
          institution: { type: "string", enum: ["UNIV", "HSC"], example: "UNIV" },
          institution_name: { type: "string", example: "Universitas Indonesia" },
          major: { type: "string", example: "Computer Science" },
          wa_number: { type: "string", example: "081234567890" },
          line_id: { type: "string", example: "johndoe_line" },
          insta_acc: { type: "string", example: "@johndoe" },
        },
      },
      CreateTeamRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Team Alpha" },
          referral: { type: "string", example: "REF123" },
        },
      },
      JoinTeamRequest: {
        type: "object",
        required: ["code"],
        properties: {
          code: { type: "string", example: "TEAM-XYZ123" },
        },
      },
      StaffRequest: {
        type: "object",
        required: ["name", "email", "password", "role", "divisionId"],
        properties: {
          name: { type: "string", example: "Jane Admin" },
          email: { type: "string", format: "email", example: "jane@sxcintersummit.com" },
          password: { type: "string", example: "adminpassword" },
          role: {
            type: "string",
            enum: ["ADMIN", "BMC_ADMIN", "BCL_ADMIN", "IBCC_ADMIN", "IBPC_ADMIN", "CHAMBERS_ADMIN", "COMPANY_VISIT_ADMIN", "IC_ADMIN", "PO"],
            example: "IBCC_ADMIN",
          },
          divisionId: { type: "integer", example: 1 },
        },
      },
      ReferralRequest: {
        type: "object",
        required: ["code", "discount", "validUntil"],
        properties: {
          code: { type: "string", example: "SUMMIT2025" },
          discount: { type: "integer", example: 20 },
          validUntil: { type: "string", format: "date-time", example: "2025-10-31T23:59:59Z" },
        },
      },
      NotificationRequest: {
        type: "object",
        required: ["title", "message"],
        properties: {
          title: { type: "string", example: "Pengumuman Penting" },
          message: { type: "string", example: "Tahap seleksi berkas telah dibuka." },
        },
      },
      UpdateStatusRequest: {
        type: "object",
        required: ["statusId"],
        properties: {
          teamId: { type: "integer", example: 1 },
          registrationId: { type: "integer", example: 1 },
          statusId: { type: "integer", example: 2 },
          score: { type: "number", example: 85.5 },
        },
      },
    },
  },
  tags: [
    { name: "Health", description: "Cek ketersediaan API server" },
    { name: "Auth", description: "Pendaftaran, login, autentikasi OTP, dan manajemen sesi" },
    { name: "User - Profile", description: "Manajemen profil peserta dan pengecekan status pendaftaran" },
    { name: "User - BMC", description: "Business Model Competition (Khusus Peserta HSC / SMA)" },
    { name: "User - BCL", description: "Bootcamp & Leadership (Peserta Umum)" },
    { name: "User - IBCC", description: "International Business Case Competition (Peserta Universitas)" },
    { name: "User - IBPC", description: "International Business Plan Competition (Peserta Universitas)" },
    { name: "User - Chambers", description: "SxC Chambers Seminar & Networking" },
    { name: "Submission", description: "Upload berkas KTM, bukti pembayaran, dan tugas/proposal" },
    { name: "Admin - IT / Super Admin", description: "Kelola akun staff, kode referral, dan log aktivitas" },
    { name: "Admin - PO", description: "Project Officer dashboard dan rekap per program" },
    { name: "Admin - BMC", description: "Manajemen tim & peserta Business Model Competition" },
    { name: "Admin - BCL", description: "Manajemen peserta & data event BCL" },
    { name: "Admin - IBCC", description: "Manajemen tim, peserta, dan export data IBCC" },
    { name: "Admin - IBPC", description: "Manajemen tim, peserta, dan export data IBPC" },
    { name: "Admin - Chambers", description: "Manajemen pendaftaran & export data Chambers" },
    { name: "Admin - ComVis", description: "Manajemen pendaftaran Company Visit" },
  ],
  paths: {
    "/api": {
      get: {
        tags: ["Health"],
        summary: "Cek kesehatan API",
        responses: {
          200: {
            description: "API berjalan dengan baik",
            content: { "text/plain": { schema: { type: "string", example: "API is running" } } },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Pendaftaran akun peserta baru",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
        },
        responses: {
          200: { description: "Pendaftaran berhasil, kode OTP dikirimkan ke email" },
          400: { description: "Validasi gagal atau email sudah terdaftar" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login pengguna / staff",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          200: { description: "Login berhasil dan token dikembalikan/disimpan di cookie" },
          401: { description: "Email atau password salah" },
        },
      },
    },
    "/api/auth/verifyOtp": {
      post: {
        tags: ["Auth"],
        summary: "Verifikasi kode OTP pendaftaran / aktivasi",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyOtpRequest" } } },
        },
        responses: {
          200: { description: "Verifikasi OTP berhasil" },
          400: { description: "Kode OTP salah atau telah kadaluarsa" },
        },
      },
    },
    "/api/auth/forgotPassword": {
      post: {
        tags: ["Auth"],
        summary: "Permintaan reset password (mengirim OTP ke email)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordRequest" } } },
        },
        responses: {
          200: { description: "OTP reset password telah dikirim ke email" },
        },
      },
    },
    "/api/auth/resetPassword": {
      post: {
        tags: ["Auth"],
        summary: "Reset kata sandi dengan password baru",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordRequest" } } },
        },
        responses: {
          200: { description: "Kata sandi berhasil diubah" },
        },
      },
    },
    "/api/auth/sendnewOTP": {
      post: {
        tags: ["Auth"],
        summary: "Mengirim ulang kode OTP",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordRequest" } } },
        },
        responses: {
          200: { description: "Kode OTP baru telah dikirim" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout dan blacklist JWT token saat ini",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: "Logout berhasil" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Ambil data payload token sesi saat ini",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: "Data sesi pengguna saat ini" },
        },
      },
    },
    "/api/auth/google": {
      get: {
        tags: ["Auth"],
        summary: "Redirect pengguna ke Google OAuth consent screen",
        responses: {
          302: { description: "Redirect ke halaman autentikasi Google" },
        },
      },
    },
    "/api/auth/google/callback": {
      get: {
        tags: ["Auth"],
        summary: "Callback endpoint setelah autentikasi Google OAuth",
        responses: {
          302: { description: "Redirect ke frontend dengan token sesi" },
        },
      },
    },

    "/api/users/profile": {
      get: {
        tags: ["User - Profile"],
        summary: "Mendapatkan rincian profil pengguna yang sedang login",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: "Detail profil user dan institusi" },
        },
      },
    },
    "/api/users/profile/update": {
      patch: {
        tags: ["User - Profile"],
        summary: "Memperbarui informasi profil pengguna",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProfileUpdateRequest" } } },
        },
        responses: {
          200: { description: "Profil berhasil diperbarui" },
        },
      },
    },
    "/api/users/card/delete": {
      delete: {
        tags: ["User - Profile"],
        summary: "Menghapus berkas KTM / ID Card yang sudah diupload",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: "KTM berhasil dihapus" },
        },
      },
    },
    "/api/users/registered": {
      get: {
        tags: ["User - Profile"],
        summary: "Melihat daftar kompetisi/program yang telah didaftari pengguna",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: "Daftar pendaftaran seminar dan tim kompetisi" },
        },
      },
    },
    "/api/users/referral/{name}": {
      post: {
        tags: ["User - Profile"],
        summary: "Mengecek validitas kode referral untuk program tertentu",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: "name", in: "path", required: true, schema: { type: "string", example: "IBCC" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { code: { type: "string", example: "SUMMIT2025" } } } } },
        },
        responses: {
          200: { description: "Hasil pengecekan diskon kode referral" },
        },
      },
    },

    "/api/users/bmc/team/create": {
      post: {
        tags: ["User - BMC"],
        summary: "Membuat tim baru untuk kompetisi BMC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTeamRequest" } } },
        },
        responses: { 201: { description: "Tim berhasil dibuat dengan kode unik tim" } },
      },
    },
    "/api/users/bmc/team/join": {
      post: {
        tags: ["User - BMC"],
        summary: "Bergabung ke tim BMC menggunakan kode tim",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/JoinTeamRequest" } } },
        },
        responses: { 200: { description: "Berhasil bergabung ke tim" } },
      },
    },
    "/api/users/bmc/team/member": {
      get: {
        tags: ["User - BMC"],
        summary: "Melihat anggota tim BMC pengguna",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar anggota tim" } },
      },
    },
    "/api/users/bmc/individual": {
      post: {
        tags: ["User - BMC"],
        summary: "Pendaftaran BMC jalur individu",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Pendaftaran individu BMC berhasil" } },
      },
    },
    "/api/users/bmc/announcement": {
      get: {
        tags: ["User - BMC"],
        summary: "Melihat daftar pengumuman & notifikasi untuk BMC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar pengumuman" } },
      },
    },
    "/api/users/bmc/announcement/read/{id}": {
      patch: {
        tags: ["User - BMC"],
        summary: "Menandai pengumuman telah dibaca",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Status dibaca berhasil diupdate" } },
      },
    },

    "/api/users/bcl/announcement": {
      get: {
        tags: ["User - BCL"],
        summary: "Melihat pengumuman acara BCL",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar pengumuman" } },
      },
    },
    "/api/users/bcl/form": {
      post: {
        tags: ["User - BCL"],
        summary: "Mengisi form pendaftaran & kuesioner BCL",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Form berhasil disimpan" } },
      },
    },
    "/api/users/bcl/register": {
      post: {
        tags: ["User - BCL"],
        summary: "Registrasi seminar BCL",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Pendaftaran seminar BCL berhasil" } },
      },
    },
    "/api/users/bcl/cancel": {
      delete: {
        tags: ["User - BCL"],
        summary: "Batalkan registrasi BCL",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Registrasi dibatalkan" } },
      },
    },

    "/api/users/ibcc/team/create": {
      post: {
        tags: ["User - IBCC"],
        summary: "Membuat tim baru untuk IBCC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTeamRequest" } } },
        },
        responses: { 201: { description: "Tim IBCC berhasil dibuat" } },
      },
    },
    "/api/users/ibcc/team/join": {
      post: {
        tags: ["User - IBCC"],
        summary: "Bergabung ke tim IBCC dengan kode tim",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/JoinTeamRequest" } } },
        },
        responses: { 200: { description: "Berhasil masuk ke tim IBCC" } },
      },
    },
    "/api/users/ibcc/team": {
      get: {
        tags: ["User - IBCC"],
        summary: "Rincian tim IBCC yang sedang diikuti",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Informasi tim dan status" } },
      },
    },
    "/api/users/ibcc/team/exit": {
      delete: {
        tags: ["User - IBCC"],
        summary: "Keluar dari tim IBCC (oleh anggota)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Berhasil keluar dari tim" } },
      },
    },
    "/api/users/ibcc/team/delete": {
      delete: {
        tags: ["User - IBCC"],
        summary: "Menghapus tim IBCC (oleh leader tim)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Tim berhasil dihapus" } },
      },
    },

    "/api/users/ibpc/team/create": {
      post: {
        tags: ["User - IBPC"],
        summary: "Membuat tim baru untuk IBPC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTeamRequest" } } },
        },
        responses: { 201: { description: "Tim IBPC berhasil dibuat" } },
      },
    },
    "/api/users/ibpc/team/join": {
      post: {
        tags: ["User - IBPC"],
        summary: "Bergabung ke tim IBPC dengan kode tim",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/JoinTeamRequest" } } },
        },
        responses: { 200: { description: "Berhasil bergabung ke tim IBPC" } },
      },
    },
    "/api/users/ibpc/team": {
      get: {
        tags: ["User - IBPC"],
        summary: "Rincian tim IBPC pengguna",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Informasi detail tim" } },
      },
    },

    "/api/users/chambers/announcement": {
      get: {
        tags: ["User - Chambers"],
        summary: "Melihat pengumuman acara Chambers",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar pengumuman" } },
      },
    },
    "/api/users/chambers/form/{day}": {
      post: {
        tags: ["User - Chambers"],
        summary: "Isi form kuesioner pendaftaran Chambers",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: "day", in: "path", required: true, schema: { type: "string", enum: ["DAY1", "DAY2"] } },
        ],
        responses: { 200: { description: "Form berhasil disimpan" } },
      },
    },
    "/api/users/chambers/register/{day}": {
      post: {
        tags: ["User - Chambers"],
        summary: "Registrasi kehadiran Chambers",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: "day", in: "path", required: true, schema: { type: "string", enum: ["DAY1", "DAY2"] } },
        ],
        responses: { 200: { description: "Pendaftaran berhasil" } },
      },
    },

    "/api/submission/{programId}/{stage}/{type}": {
      post: {
        tags: ["Submission"],
        summary: "Upload file submission (KTM, Bukti Bayar, Tugas, dsb.)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: "programId", in: "path", required: true, schema: { type: "integer", example: 1 } },
          { name: "stage", in: "path", required: true, schema: { type: "string", enum: ["REGISTRATION", "PREELIM", "SEMINAR", "FINAL", "SEMIFINAL"] } },
          { name: "type", in: "path", required: true, schema: { type: "string", enum: ["IDCARD", "PAYMENT", "TASK", "PROMOTION", "CV"] } },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary", description: "File berkas yang diunggah" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Berkas berhasil diupload" },
        },
      },
    },
    "/api/submission/event/{event}": {
      get: {
        tags: ["Submission"],
        summary: "Mengambil daftar berkas submission berdasarkan nama event",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: "event", in: "path", required: true, schema: { type: "string", example: "IBCC" } },
        ],
        responses: {
          200: { description: "Daftar berkas submission" },
        },
      },
    },

    "/api/admin/users": {
      get: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Ambil seluruh data pengguna terdaftar",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Seluruh daftar user" } },
      },
    },
    "/api/admin/staffs": {
      get: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Ambil seluruh data staff panitia",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Seluruh daftar staff" } },
      },
    },
    "/api/admin/it/staff": {
      get: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Daftar staff panitia (khusus Super Admin)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "List staff" } },
      },
      post: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Tambah akun staff panitia baru",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StaffRequest" } } },
        },
        responses: { 201: { description: "Staff berhasil ditambahkan" } },
      },
    },
    "/api/admin/it/staff/{id}": {
      patch: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Perbarui informasi staff",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StaffRequest" } } },
        },
        responses: { 200: { description: "Staff berhasil diupdate" } },
      },
      delete: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Hapus staff",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Staff berhasil dihapus" } },
      },
    },
    "/api/admin/it/activity": {
      get: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Melihat log aktivitas para admin",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Activity log admin" } },
      },
    },
    "/api/admin/it/referral": {
      get: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Melihat seluruh kode referral aktif",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar kode referral" } },
      },
      post: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Membuat kode referral baru",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReferralRequest" } } },
        },
        responses: { 201: { description: "Kode referral berhasil dibuat" } },
      },
    },
    "/api/admin/it/referral/{id}": {
      patch: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Update data kode referral",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReferralRequest" } } },
        },
        responses: { 200: { description: "Referral berhasil diupdate" } },
      },
      delete: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Hapus kode referral",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Referral berhasil dihapus" } },
      },
    },
    "/api/admin/it/referral/total": {
      get: {
        tags: ["Admin - IT / Super Admin"],
        summary: "Statistik total penggunaan kode referral",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Statistik pemakaian referral" } },
      },
    },

    "/api/admin/po/{program}": {
      get: {
        tags: ["Admin - PO"],
        summary: "Rekap data peserta / tim untuk Project Officer",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: "program", in: "path", required: true, schema: { type: "string", example: "bmc" } },
        ],
        responses: { 200: { description: "Data rekapitulasi program" } },
      },
    },

    "/api/admin/bmc/teams": {
      get: {
        tags: ["Admin - BMC"],
        summary: "Daftar seluruh tim peserta BMC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar tim BMC" } },
      },
    },
    "/api/admin/bmc/teams/status": {
      patch: {
        tags: ["Admin - BMC"],
        summary: "Update status tim BMC (lolos/tidak/verifikasi)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateStatusRequest" } } },
        },
        responses: { 200: { description: "Status tim berhasil diubah" } },
      },
    },
    "/api/admin/bmc/participants": {
      get: {
        tags: ["Admin - BMC"],
        summary: "Daftar seluruh peserta individu BMC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar peserta" } },
      },
    },
    "/api/admin/bmc/participants/status": {
      patch: {
        tags: ["Admin - BMC"],
        summary: "Update status peserta individu BMC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateStatusRequest" } } },
        },
        responses: { 200: { description: "Status peserta berhasil diubah" } },
      },
    },
    "/api/admin/bmc/announcement/team/{id}": {
      post: {
        tags: ["Admin - BMC"],
        summary: "Kirim pengumuman khusus ke anggota tim tertentu",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/NotificationRequest" } } },
        },
        responses: { 200: { description: "Pengumuman berhasil terkirim" } },
      },
    },
    "/api/admin/bmc/notification": {
      post: {
        tags: ["Admin - BMC"],
        summary: "Kirim notifikasi broadcast ke seluruh peserta BMC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/NotificationRequest" } } },
        },
        responses: { 200: { description: "Notifikasi berhasil disiarkan" } },
      },
    },
    "/api/admin/bmc/search": {
      get: {
        tags: ["Admin - BMC"],
        summary: "Cari tim BMC berdasarkan nama / kode",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: "query", in: "query", schema: { type: "string" } }],
        responses: { 200: { description: "Hasil pencarian tim" } },
      },
    },

    "/api/admin/bcl/participants": {
      get: {
        tags: ["Admin - BCL"],
        summary: "Daftar seluruh peserta BCL",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar peserta BCL" } },
      },
    },
    "/api/admin/bcl/dataevent": {
      get: {
        tags: ["Admin - BCL"],
        summary: "Data respon form dan kuesioner BCL",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Data kuesioner peserta" } },
      },
    },
    "/api/admin/bcl/announcement": {
      post: {
        tags: ["Admin - BCL"],
        summary: "Kirim pengumuman ke peserta BCL",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/NotificationRequest" } } },
        },
        responses: { 200: { description: "Pengumuman terkirim" } },
      },
    },
    "/api/admin/bcl/search": {
      get: {
        tags: ["Admin - BCL"],
        summary: "Cari peserta BCL",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: "query", in: "query", schema: { type: "string" } }],
        responses: { 200: { description: "Hasil pencarian peserta" } },
      },
    },

    "/api/admin/ibcc/teams": {
      get: {
        tags: ["Admin - IBCC"],
        summary: "Ambil seluruh tim peserta IBCC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar tim IBCC" } },
      },
    },
    "/api/admin/ibcc/teams/status": {
      patch: {
        tags: ["Admin - IBCC"],
        summary: "Update status tim IBCC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateStatusRequest" } } },
        },
        responses: { 200: { description: "Status tim berhasil diupdate" } },
      },
    },
    "/api/admin/ibcc/participants": {
      get: {
        tags: ["Admin - IBCC"],
        summary: "Ambil seluruh peserta individu IBCC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar peserta" } },
      },
    },
    "/api/admin/ibcc/announcement/all": {
      post: {
        tags: ["Admin - IBCC"],
        summary: "Kirim pengumuman ke seluruh peserta IBCC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/NotificationRequest" } } },
        },
        responses: { 200: { description: "Pengumuman broadcast terkirim" } },
      },
    },
    "/api/admin/ibcc/export/{eventName}": {
      post: {
        tags: ["Admin - IBCC"],
        summary: "Export data peserta & tim IBCC ke file Excel",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: "eventName", in: "path", required: true, schema: { type: "string", example: "IBCC" } }],
        responses: {
          200: {
            description: "Download file Excel (.xlsx)",
            content: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {} },
          },
        },
      },
    },

    "/api/admin/ibpc/teams": {
      get: {
        tags: ["Admin - IBPC"],
        summary: "Ambil seluruh tim peserta IBPC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar tim IBPC" } },
      },
    },
    "/api/admin/ibpc/teams/status": {
      patch: {
        tags: ["Admin - IBPC"],
        summary: "Update status tim IBPC",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateStatusRequest" } } },
        },
        responses: { 200: { description: "Status tim berhasil diubah" } },
      },
    },
    "/api/admin/ibpc/export/{eventName}": {
      post: {
        tags: ["Admin - IBPC"],
        summary: "Export data peserta IBPC ke Excel",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: "eventName", in: "path", required: true, schema: { type: "string", example: "IBPC" } }],
        responses: { 200: { description: "File Excel terdownload" } },
      },
    },

    "/api/admin/chambers/participants": {
      get: {
        tags: ["Admin - Chambers"],
        summary: "Ambil seluruh pendaftar Chambers",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar pendaftar Chambers" } },
      },
    },
    "/api/admin/chambers/dataevent": {
      get: {
        tags: ["Admin - Chambers"],
        summary: "Data form kuesioner peserta Chambers",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Data respon form" } },
      },
    },
    "/api/admin/chambers/export/{eventName}": {
      post: {
        tags: ["Admin - Chambers"],
        summary: "Export data Chambers ke Excel",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: "eventName", in: "path", required: true, schema: { type: "string", example: "Chambers" } }],
        responses: { 200: { description: "File Excel terdownload" } },
      },
    },

    "/api/admin/comvis/participants": {
      get: {
        tags: ["Admin - ComVis"],
        summary: "Ambil seluruh pendaftar Company Visit",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Daftar peserta Company Visit" } },
      },
    },
    "/api/admin/comvis/dataevent": {
      get: {
        tags: ["Admin - ComVis"],
        summary: "Data tambahan form peserta Company Visit",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Data respon form" } },
      },
    },
    "/api/admin/comvis/announcement": {
      post: {
        tags: ["Admin - ComVis"],
        summary: "Kirim pengumuman ke peserta Company Visit",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/NotificationRequest" } } },
        },
        responses: { 200: { description: "Pengumuman terkirim" } },
      },
    },
  },
};
