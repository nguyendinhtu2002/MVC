const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const handlebars = require("express-handlebars");
const vendorrouter = require("../router/Vendor");
const customerRouter = require("../router/Customer");
const shipperRouter = require("../router/Shipper");
const productRouter = require("../router/Product");
const ordersRouter = require("../router/Orders");
const distributionHubRouter = require("../router/Distribution");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const connectDatabase = require("../config/MongoDb.js");
const Product = require("../model/Product");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const { create } = require("express-handlebars");
const Vendor = require("../model/Vendor");
const Shipper = require("../model/Shipper");
const Customer = require("../model/Customer");
const DistributionHub = require("../model/DistributionHub");
dotenv.config();
connectDatabase();
app.use(cookieParser());
app.set("trust proxy", true);
app.use(express.json());
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
        case "==":
          return v1 % v2 == 0 ? options.fn(this) : options.inverse(this);
        case "%":
          return (v1 + 1) % v2 == 0 ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    },
  },
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./src/resources/views");
app.use(express.static(path.join(__dirname, "../public")));
const checkLoggedIn = (req, res, next) => {
  if (req.session.user) {
    if (
      req.session.user.type === "Shipper" ||
      req.session.user.type === "Vendor"
    ) {
      res.locals.Type = true;
    } else {
      res.locals.Type = false;
    }
    res.locals.loggedIn = true;
  } else {
    res.locals.Type = false;
    res.locals.loggedIn = false;
  }
  next();
};

app.use(checkLoggedIn);

app.get("/", async (req, res) => {
  const products = await Product.find({}).lean();

  if (req.session.user) {
    if (req.session.user.type === "Shipper") {
      return res.redirect("/shipper/getall/order");
    } else if (req.session.user.type === "Vendor") {
      return res.redirect("/vendor/list_product");
    } else {
      return res.render("homeCustomer", {
        products,
        helpers: {
          ifCond: function (v1, operator, v2, options) {
            switch (operator) {
              case "==":
                return v1 % v2 == 0 ? options.fn(this) : options.inverse(this);
              case "%":
                return (v1 + 1) % v2 == 0
                  ? options.fn(this)
                  : options.inverse(this);
              default:
                return options.inverse(this);
            }
          },
          gt: function (value1, value2) {
            return value1 > value2;
          },
          inc: function (value) {
            return parseInt(value) + 1;
          },
          length: function (array) {
            if (Array.isArray(array)) {
              return array.length;
            }
            return 0;
          },
          eq: function (value1, value2, options) {
            return value1 === value2 ? options.fn(this) : options.inverse(this);
          },
        },
      });
    }
  } else {
    return res.render("homeCustomer", {
      products,
      helpers: {
        ifCond: function (v1, operator, v2, options) {
          switch (operator) {
            case "==":
              return v1 % v2 == 0 ? options.fn(this) : options.inverse(this);
            case "%":
              return (v1 + 1) % v2 == 0
                ? options.fn(this)
                : options.inverse(this);
            default:
              return options.inverse(this);
          }
        },
        gt: function (value1, value2) {
          return value1 > value2;
        },
        inc: function (value) {
          return parseInt(value) + 1;
        },
        length: function (array) {
          if (Array.isArray(array)) {
            return array.length;
          }
          return 0;
        },
        eq: function (value1, value2, options) {
          return value1 === value2 ? options.fn(this) : options.inverse(this);
        },
      },
    });
  }
});
app.get("/info", async (req, res) => {
  if (req.session.user) {
    if (req.session.user.type === "Vendor") {
      try {
        // console.log(req.user)
        const vendor = await Vendor.findById(req.session.user.id).lean();
        if (vendor) {
          return res.render("vendor_info", { vendor });
        }
      } catch (error) {
        console.log(error);
        const message = "Internal server error";
        return res.render("vendor_info", { message });
      }
    } else if (req.session.user.type === "Shipper") {
      try {
        const data = await DistributionHub.find({}).lean();
        const shipper = await Shipper.findById(req.session.user.id).lean();
        if (shipper) {
          return res.render("shipper_info", {
            shipper,
            data,
            selectedHub: shipper.distributionHub,
            helpers: {
              isEqualObjectId: function (v1, v2) {
                return v1.toString() === v2.toString();
              },
              typeof: function (value) {
                return typeof value;
              },
            },
          });
        }
      } catch (error) {
        console.log(error);
        const message = "Internal server error";
        return res.render("shipper_info", { message });
      }
    } else if (req.session.user.type === "Customer") {
      try {
        // console.log(req.user)
        const customer = await Customer.findById(req.session.user.id).lean();
        if (customer) {
          return res.render("customer_info", { customer });
        }
      } catch (error) {
        console.log(error);
        const message = "Internal server error";
        return res.render("customer_info", { message });
      }
    }
  } else {
    return res.redirect("/login");
  }
});
app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("login");
});
app.post("/login", async (req, res) => {
  const { username, password, type } = req.body;
  if (type === "customer") {
    try {
      const customer = await Customer.findOne({ username });
      if (customer && (await customer.matchPassword(password))) {
        req.session.user = {
          id: customer._id,
          type: "Customer",
        };
        req.session.isLoggedInCustomer = true;
        const message = "Customer logged in successfully";
        return res.render("login", { message }, (err, html) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Internal server error");
          }
          res.redirect("/");
        });
      } else {
        const message = "Invalid username or password";
        return res.render("login", { message });
      }
    } catch (error) {
      console.log(error);

      const message = "Internal server error";
      return res.render("login", { message });
    }
  } else if (type === "shipper") {
    try {
      const shipper = await Shipper.findOne({ username });
      if (shipper && (await shipper.matchPassword(password))) {
        req.session.user = {
          id: shipper._id,
          type: "Shipper",
        };
        req.session.isLoggedInShipper = true;
        const message = "Shipper logged in successfully";
        return res.render("login", { message }, (err, html) => {
          if (err) {
            // console.error(err);
            return res.status(500).send("Internal server error");
          }
          res.redirect("/shipper/getall/order");
        });
      } else {
        const message = "Invalid username or password";
        return res.render("login", { message });
      }
    } catch (error) {
      console.log(error);
      const message = "Internal server error";
      return res.render("login", { message });
    }
  } else if (type === "vendor") {
    try {
      const vendor = await Vendor.findOne({ username });
      if (vendor && (await vendor.matchPassword(password))) {
        req.session.user = {
          id: vendor._id,
          type: "Vendor",
        };
        req.session.isLoggedInVendor = true;
        const message = "Success";
        console.log(message);
        return res.render("login", { message }, (err, html) => {
          if (err) {
            // console.error(err);
            return res.status(500).send("Internal server error");
          }
          res.redirect("/vendor/list_product");
        });
      } else {
        const message = "Invalid username or password";
        return res.render("login", { message });
      }
    } catch (error) {
      const message = "Internal server error";
      return res.render("login", { message });
    }
  }
});
app.get("/service", (req, res) => {
  return res.render("home_service");
});
app.get("/contact", (req, res) => {
  return res.render("contact");
});
app.get("/product", async (req, res) => {
  const products = await Product.find({}).lean();

  return res.render("Product", {
    products,
    helpers: {
      ifCond: function (v1, operator, v2, options) {
        switch (operator) {
          case "==":
            return v1 % v2 == 0 ? options.fn(this) : options.inverse(this);
          case "%":
            return (v1 + 1) % v2 == 0
              ? options.fn(this)
              : options.inverse(this);
          default:
            return options.inverse(this);
        }
      },
    },
  });
});

app.get("/helper", (req, res) => {
  return res.render("helper");
});
app.get("/changePassword", (req, res) => {
  if (req.session.user.type === "Vendor") {
    return res.render("changePasswordVendor");
  } else if (req.session.user.type === "Shipper") {
    return res.render("changePasswordShipper");
  } else if (req.session.user.type === "Customer") {
    return res.render("changePasswordCustomer");
  }
});
app.use("/vendor", vendorrouter);
app.use("/shipper", shipperRouter);
app.use("/customer", customerRouter);
app.use("/products", productRouter);
app.use("/api", ordersRouter);

app.use("/api/dis", distributionHubRouter);
app.use(function (req, res, next) {
  res.status(404).render("404", { layout: false });
});
// start server
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
