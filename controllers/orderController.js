import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let currency = "inr";
let deliveryCharges = 50;

// ------------------ COD ------------------
export const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    });

    await newOrder.save();

    // Clear cart after order
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order placed successfully (COD)" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error placing order" });
  }
};

// ------------------ STRIPE ------------------
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    });

    await newOrder.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency,
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error with Stripe payment" });
  }
};

// ------------------ VERIFY STRIPE ------------------
export const verifyStripe = async (req, res) => {
  try {
    const { success, orderId, userId } = req.body;

    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });

      // Clear user's cart after successful Stripe payment
      if (userId) {
        await userModel.findByIdAndUpdate(userId, { cartData: {} });
      }

      res.json({ success: true, message: "Payment verified and cart cleared" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Verification error" });
  }
};

// ------------------ RAZORPAY (dummy) ------------------
export const placeOrderRazorpay = async (req, res) => {
  try {
    res.json({ success: true, message: "Razorpay not yet implemented" });
  } catch (error) {
    res.json({ success: false, message: "Error with Razorpay" });
  }
};

// ------------------ ADMIN ------------------
export const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: "Error fetching orders" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    res.json({ success: false, message: "Error updating status" });
  }
};

// ------------------ USER ------------------
export const userOrder = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: "Error fetching user orders" });
  }
};
