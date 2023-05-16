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
const path = require("path")
const bodyParser = require('body-parser');
const { create } = require('express-handlebars');


dotenv.config();
connectDatabase();
app.use(cookieParser());
app.set("trust proxy", true);
app.use(express.json())
app.use(cors());
app.engine(".hbs", handlebars.engine({ extname: ".hbs" }));
app.use(bodyParser.urlencoded({ extended: true }));

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
const hbs = create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    ifCond: function (v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return (v1 % v2 == 0) ? options.fn(this) : options.inverse(this);
        case '%':
          return ((v1 + 1) % v2 == 0) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    },

  }
});
app.engine('handlebars', hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./src/resources/views");
app.use(express.static(path.join(__dirname, '../public')));

app.get("/", async (req, res) => {
  const products = await Product.find({}).lean();
  return res.render("homeCustomer", {
    products,
    helpers: {
      ifCond: function (v1, operator, v2, options) {
        switch (operator) {
          case '==':
            return (v1 % v2 == 0) ? options.fn(this) : options.inverse(this);
          case '%':
            return ((v1 + 1) % v2 == 0) ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      }
    }
  });
});

app.use("/vendor", vendorrouter);
app.use("/shipper", shipperRouter);
app.use("/customer", customerRouter);
app.use("/products", productRouter);
app.use("/api", ordersRouter)
app.use("/api/dis", distributionHubRouter)
app.use(function (req, res, next) {
  res.status(404).render("404", { layout: false });
});
// start server
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
