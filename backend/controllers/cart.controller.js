import Product from "../models/product.model";

export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;

    // const prodducts = await Product.find({
    //   _id: { $in: user.cart },
    // });

    // res.status(200).json(cartProducts);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const addToCart = async (req, res) => {
  try {
    const user = req.user;

    const { productId } = req.body;
    const existingProduct = await user.cart.find(
      (item) => item.id === productId
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      user.cart.push({ productId, quantity: 1 });
    }

    console.log("User Cart:", user.cart);

    await user.save();
    res.status(200).json(user.cart);
  } catch (err) {
    res.status(500).json(err);
  }
};
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId) user.cart = [];
    else user.cart = user.cart.filter((item) => item.id !== productId);

    await user.save();
    res.status(200).json(user.cart);
  } catch (err) {
    res.status(500).json(err);
  }
};
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingProduct = user.cart.find((item) => item.id === productId);

    if (existingProduct) {
      if (quantity === 0) {
        user.cart = user.cart.filter((item) => item.id !== productId);
        await user.save();
        return res.status(200).json(user.cart);
      } else {
        existingProduct.quantity = quantity;
        await user.save();
        return res.status(200).json(user.cart);
      }
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    console.log("User Cart:", user.cart);
  } catch (err) {
    console.log("Error while updating product quantity:  ", err);
    res.status(500).json(err);
  }
};
export const checkout = async (req, res) => {};
export const getOrders = async (req, res) => {};
export const getOrderById = async (req, res) => {};
export const updateOrderToPaid = async (req, res) => {};
export const updateOrderToDelivered = async (req, res) => {};
// Compare this snippet from backend/models/Product.js:
// import mongoose from "mongoose";
//
