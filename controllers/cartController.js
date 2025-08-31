import userModel from "../models/userModel.js";

//  Add products to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body;

    if (!userId || !itemId || !size) {
      return res.json({
        success: false,
        message: "Missing required fields: userId, itemId, or size",
      });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    console.log("Current cart data:", cartData);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    console.log("Updated cart data:", cartData);
    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log("Error in addToCart:", error);
    res.json({ success: false, message: error.message });
  }
};

//  Update user cart
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body;

    if (!userId || !itemId || !size || quantity === undefined) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      if (cartData[itemId] && cartData[itemId][size]) {
        delete cartData[itemId][size];
        // If no sizes left for this item, remove the item entirely
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    } else {
      // Update quantity
      if (!cartData[itemId]) {
        cartData[itemId] = {};
      }
      cartData[itemId][size] = quantity;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Updated Cart" });
  } catch (error) {
    console.log("Error in updateCart:", error);
    res.json({ success: false, message: error.message });
  }
};

//  get user cart data
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    console.log("Retrieved cart data for user:", userId, cartData);

    res.json({ success: true, cartData });
  } catch (error) {
    console.log("Error in getUserCart:", error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };
