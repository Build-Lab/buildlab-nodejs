import { Long } from "bson";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    label: { type: String },
    price: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
    image: {
      type: String,
      required: true,
    },
    user: {
      type: String,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("product", productSchema);

export { Product };
