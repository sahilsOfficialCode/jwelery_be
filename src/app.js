const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const passport = require("./config/passport.js");
const cors = require("cors");
const path = require("path");
const errorMiddleware = require("./middleware/error.js");
const cookieParser = require("cookie-parser");

const app = express();

// Session setup
console.log("SESSION_SECRET:", process.env.SESSION_SECRET);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: "lax" },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://1h48b83c-5000.inc1.devtunnels.ms/",
//   "https://ecommerce-fe-git-dev-nishanth-ss-projects-6535f6dc.vercel.app/"
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// }));

app.use(cors());

// 👉 Serve static files from root/public
app.use(express.static(path.join(__dirname, "..", "public")));

// 👉 Point to src/views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// api logs
app.use(morgan("tiny"));

// Serve the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Routes
const indexRouter = require("./routes/index.route.js");
const productRouter = require("./routes/product.routes.js");
const categoryRouter = require("./routes/category.route.js");
const authRoutes = require("./routes/auth.route.js");
const userRoutes = require("./routes/user.routes.js");
const imageRouter = require("./routes/image.route.js");
const cartRouter = require("./routes/cart.route.js");
const wishListRouter = require("./routes/wishList.route.js");
const productLogsRouter = require("./routes/productLogs.route.js");
const orderRouter = require('./routes/order.route.js')
const addressRouter = require('./routes/address.route.js');
const reviewRouter = require('./routes/review.route.js');
const dashboardRoutes = require("./routes/dashboard.routes");

app.use("/", indexRouter);
app.use("/api/auth", authRoutes);
app.use("/api/product", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/user", userRoutes);
app.use("/api/image", imageRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishList", wishListRouter);
app.use("/api/productLogs", productLogsRouter);
app.use("/api/order",orderRouter)
app.use("/api/address",addressRouter)
app.use("/api/review",reviewRouter);
app.use("/api/dashboard", dashboardRoutes);

// Error middleware
app.use(errorMiddleware);

module.exports = app;
