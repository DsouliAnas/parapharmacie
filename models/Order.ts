import mongoose, {
  Schema,
  models,
  model,
  type Document,
} from "mongoose";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

interface OrderProduct {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface OrderDocument extends Document {
  orderNumber: string;

  user: mongoose.Types.ObjectId;

  customerName: string;
  customerEmail: string;

  phone: string;
  backupPhone?: string;

  address: string;

  products: OrderProduct[];

  totalPrice: number;

  paymentMethod: string;

  status: OrderStatus;

  deliveredAt?: Date;

  isRevenueCounted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<OrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => {
        const timestamp =
          Date.now()
            .toString(36)
            .toUpperCase();

        const random =
          Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();

        return `FAIRYS-${timestamp}-${random}`;
      },
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    backupPhone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    deliveredAt: {
      type: Date,
      default: undefined,
    },

    isRevenueCounted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order =
  models.Order ||
  model<OrderDocument>(
    "Order",
    OrderSchema
  );

export default Order;