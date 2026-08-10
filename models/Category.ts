import { Schema, models, model } from "mongoose";

const SubcategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    subcategories: {
      type: [SubcategorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Category =
  models.Category ||
  model("Category", CategorySchema);

export default Category;