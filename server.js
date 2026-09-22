require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const routes = require("./routes/index");
const passport = require("./config/passport");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger");

const app = express();

app.use((req, res, next) => {
  if (req.path.startsWith("/api-docs")) {
    return next();
  }
  helmet()(req, res, next);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: "SxC International Summit 2025 API Docs",
  })
);
app.use(
  cors({
    origin: ["http://localhost:5173"], // whitelist frontend Anda
    credentials: true, // izinkan pengiriman cookie
  })
);
app.use(express.json());
app.use(cookieParser()); // <-- tambahkan ini
app.use((req, res, next) => {
  if (req.path === "/" || req.path === "/index.html") {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  } else if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-cache");
  } else {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
  next();
});
app.use(passport.initialize());
app.use("/api", routes);
app.use(require("./middlewares/errorHandler.middleware"));

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
