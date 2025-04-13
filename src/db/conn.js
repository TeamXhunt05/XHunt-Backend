const mongoose = require("mongoose");
require("dotenv").config();

const localDB = "mongodb://0.0.0.0:27017/node_hunt_db";

mongoose
  .connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`DB connection successful`);
  })
  .catch((error) => {
    console.log(error);
  });

mongoose.Promise = global.Promise;
module.exports = {
  // UserLogins: require("../models/users"),

  // School: require("../models/schools"),
  // Role: require("../models/roles"),
  // Stream: require("../models/streams"),
  // Class: require("../models/classes"),
  // Lunch: require("../models/lunch_holls"),
  // Announcement: require("../models/announcements"),
  // Meal_History: require("../models/meal_history"),
  // Subject: require("../models/subjects"),
  // Time_Table: require("../models/time_tables"),
  // StripePayment: require("../models/stripe_payments"),
  // Plan: require("../models/plans"),
  // Contact: require("../models/contacts"),
  Setting: require("../models/settings"),
  Page: require("../models/pages"),




  //HUNT DB
  Store: require("../models/authentication/StoreModel"),
  Pin: require("../models/inventory/PinModel"),
  Product: require("../models/inventory/ProductModel"),
  UserLogins: require("../models/authentication/UserLoginInfotModel"),
  StoreReview: require("../models/authentication/StoreReviewModel"),
  Business: require("../models/authentication/BusinessModel"),
  Notification: require("../models/inventory/NotificationModel"),
  UserWallet: require("../models/inventory/UserWalletModel"),
  MostLovedPin: require("../models/inventory/MostLovedPins"),

  //PAYMENT
  Order: require("../models/payment/OrderModel"),
  Cart: require("../models/payment/CartModel"),
  Payment: require("../models/payment/HandlePaymentModel"),
  PickupOTP: require("../models/payment/PickupOTPModel"),
  Return: require("../models/payment/ReturnModel"),
  StoreBankDetail: require("../models/payment/StoreBankDetailsModel"),
  StoreBillingPaymen: require("../models/payment/StoreBillingPaymentModel"),















};
