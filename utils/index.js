const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Halaman Form
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>SMTP Tester</title>
        <style>
          body { font-family: Poppins, sans-serif; background: #f0f2f5; display:flex; justify-content:center; align-items:center; height:100vh; }
          .card { background: rgba(255,255,255,0.2); backdrop-filter: blur(12px); border-radius: 16px; padding: 20px 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); width: 500px; }
          h2 { text-align: center; }
          label { display:block; margin:10px 0 5px; }
          input, textarea { width:100%; padding:10px; border-radius:8px; border:1px solid #ccc; margin-bottom:15px; }
          button { width:100%; padding:12px; border:none; border-radius:8px; background:#4f46e5; color:white; font-weight:bold; cursor:pointer; }
          button:hover { background:#4338ca; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>SMTP Tester</h2>
          <form method="POST" action="/send">
            <label>SMTP Host</label>
            <input name="host" required />
            <label>Port</label>
            <input name="port" value="587" required />
            <label>Secure (true/false)</label>
            <input name="secure" value="false" required />
            <label>Username</label>
            <input name="user" required />
            <label>Password</label>
            <input type="password" name="pass" required />
            <label>Dari (From)</label>
            <input name="from" required />
            <label>Ke (To)</label>
            <input name="to" required />
            <label>Subjek</label>
            <input name="subject" value="SMTP Test ✔" />
            <label>Pesan</label>
            <textarea name="message">Halo, ini email test SMTP dari Node.js</textarea>
            <button type="submit">Kirim Email</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// Proses kirim email
app.post("/send", async (req, res) => {
  const { host, port, secure, user, pass, from, to, subject, message } =
    req.body;

  let transporter = nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: secure === "true",
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  try {
    let info = await transporter.sendMail({
      from,
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
      headers: {
        "List-Unsubscribe":
          "<mailto:info@sxcintersummit.com>, <https://sxcintersummit.com>",
      },
    });

    res.send(
      `<h2 style="color:green;">✅ Email berhasil dikirim! ID: ${info.messageId}</h2><a href="/">Kembali</a>`
    );
  } catch (err) {
    res.send(
      `<h2 style="color:red;">❌ Gagal kirim email: ${err.message}</h2><a href="/">Coba Lagi</a>`
    );
  }
});

app.listen(3000, () =>
  console.log("SMTP Tester UI running on http://localhost:3000")
);
