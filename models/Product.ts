import mongoose, { Schema, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },

    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
    },

    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  models.Product ||
  mongoose.model("Product", ProductSchema);

export default Product;