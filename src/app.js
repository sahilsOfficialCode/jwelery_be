const express = require('express');
const session = require("express-session");
const passport = require("./config/passport.js");
const cors = require('cors');
const path = require('path');
const errorMiddleware = require('./middleware/error.js');

const app = express();

// Session setup
console.log("SESSION_SECRET:", process.env.SESSION_SECRET);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cors());

// 👉 Serve static files from root/public
app.use(express.static(path.join(__dirname, "..", "public")));

// 👉 Point to src/views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Serve the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Routes
const indexRouter = require('./routes/index.route.js');
const productRouter = require('./routes/product.routes.js')
const authRoutes = require("./routes/auth.route.js");

app.use("/", indexRouter);
app.use("/api/product",productRouter)
app.use("/auth",authRoutes);


// Error middleware ee
app.use(errorMiddleware);

module.exports = app;
