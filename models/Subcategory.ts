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
      lowercase: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

SubcategorySchema.index(
  {
    category: 1,
    slug: 1,
  },
  {
    unique: true,
  }
);

const Subcategory =
  models.Subcategory ||
  model("Subcategory", SubcategorySchema);

export default Subcategory;