import mongoose, {
  Schema,
  models,
} from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match:
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 200,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "customer",
        "admin",
      ],
      default: "customer",
      required: true,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    city: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    postalCode: {
      type: String,
      trim: true,
      maxlength: 20,
    },
  },
  {
    timestamps: true,
  }
);

const User =
  models.User ||
  mongoose.model(
    "User",
    UserSchema
  );

export default User;