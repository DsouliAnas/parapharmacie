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
    },

    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Subcategory =
  models.Subcategory ||
  model("Subcategory", SubcategorySchema);

export default Subcategory;