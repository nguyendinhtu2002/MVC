const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const handlebars = require("express-handlebars");
const vendorrouter = require("../router/Vendor");
const customerRouter = require("../router/Customer");
const shipperRouter = require("../router/Shipper");
const productRouter = require("../router/Product")
const ordersRouter = require("../router/Orders")
const distributionHubRouter = require("../router/Distribution")
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const connectDatabase = require("../config/MongoDb.js");
const Product = require("../model/Product");
const app = express();

dotenv.config();
connectDatabase();
app.use(cookieParser());
app.set("trust proxy", true);
app.use(express.json())
app.use(cors());
app.engine(".hbs", handlebars.engine({ extname: ".hbs" }));
app.use(express.urlencoded({ extended: true }));
const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: "sessions",
});

store.on("error", function (error) {
  console.log(error);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.engine("handlebars", handlebars.engine());
app.set("view engine", "hbs");
app.set("views", "./src/resources/views");

app.get("/", async (req, res) => {
  const type =
    req.session.user?.type !== undefined ? req.session.user?.type : "";

  if (type === "Vendor") {
    return res.render("homeVendor");
  } else if (type === "Shipper") {
    return res.render("homeShipper");
  } else if (type === "Customer") {
    try {
      const products = await Product.find({}).lean();
      return res.render("homeCustomer", { products });
    } catch (err) {
      console.error("Error fetching products", err);
      return res.status(500).render("error");
    }
  } else {
    return res.render("404");
  }
});

app.use("/vendor", vendorrouter);
app.use("/shipper", shipperRouter);
app.use("/customer", customerRouter);
app.use("/products", productRouter);
app.use("/api",ordersRouter)
app.use ("/api/dis",distributionHubRouter)
app.use(function (req, res, next) {
  res.status(404).render("404", { layout: false });
});
// start server
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
