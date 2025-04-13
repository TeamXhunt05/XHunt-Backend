const mongoose = require("mongoose");
const {
  LOGIN_TYPE,
  DEFAULT_LOGIN_TYPE,
  ROLE_TYPE,
} = require("../../constant/constant");

const Schema = mongoose.Schema; 

const LanguageSchema = new Schema({
  language_code: { type: String, default: "en" },
});

const UserLoginInfoSchema = new Schema(
  {
    auth_type: {
      type: String,
      enum: LOGIN_TYPE,
      default: DEFAULT_LOGIN_TYPE,
      required: true,
    },
    roles: {
      type: String,
      enum: ROLE_TYPE,
      required: true,
    },
    email: { type: String, required: false, unique: false, },
    password: { type: String, required: false, default: "" },
    mobile_number: { type: String, default: "", required: false },
    phone_code: { type: String, default: "", required: false },
    social_id: { type: String, default: "", required: false },
    platform: { type: String, default: "FORM", required: false },
    language: { type: LanguageSchema },
    user_status: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    username: { type: String, required: false, default: "" },
    otp: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    avatar: {
      type: String,
      default: ''
  },
  firebase_token: {
    type: String,
    default: ''
},
isNotification: {
  type: Boolean,
  default: true

},
profile_summary: { type: String, default: "" },



  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

UserLoginInfoSchema.methods.generate_pw_hash = function () {
  this.password = generate_password_hash(this.password).decode("utf-8");
  return this.password;
};

UserLoginInfoSchema.methods.check_pw_hash = function (password) {
  return check_password_hash(this.password, password);
};

UserLoginInfoSchema.statics.validate_fields = function (fields) {
  if (fields.auth_type === "EMAIL") {
    if (
      !fields.email ||
      typeof fields.email !== "string" ||
      !validate_email(fields.email)
    ) {
      return { message: "Email is missing or invalid." };
    }
  }
  if (fields.auth_type === "PHONE") {
    if (
      !fields.phone ||
      typeof fields.phone !== "string" ||
      !validate_phone(fields.phone_code + fields.phone)
    ) {
      return { message: "Phone is missing or invalid." };
    }
  }
  if (
    !fields.password ||
    typeof fields.password !== "string" ||
    fields.password.length < 6
  ) {
    return {
      message:
        "Password is missing or invalid. Password should be minimum 6 characters.",
    };
  }
  if (
    !fields.role ||
    typeof fields.role !== "string" ||
    !["ADMIN", "USER", "AGENCY"].includes(fields.role)
  ) {
    return { message: "Role is missing or invalid." };
  }
  if (
    !fields.auth_type ||
    typeof fields.auth_type !== "string" ||
    !["EMAIL", "PHONE"].includes(fields.auth_type)
  ) {
    return { message: "Auth type is missing or invalid." };
  }
  if (fields.role === "AGENCY" && !fields.parent) {
    return { message: "Parent id is required." };
  }
  return null;
};



const UserLoginInfoModel = mongoose.model(
  "users",
  UserLoginInfoSchema
);

module.exports = UserLoginInfoModel;
