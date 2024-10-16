import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;

    const prodducts = await Product.find({
      // $in is a MongoDB operator that selects the documents where the value of a field equals any value in the specified array
      _id: { $in: user.cartItems },
    });

    const cartProducts = prodducts.map((product) => {
      const cartItem = user.cartItems.find((item) => item.id === product.id);
      return {
        ...product.toJSON(),
        quantity: cartItem.quantity,
      };
    });

    res.status(200).json({ cartItems: cartProducts });
  } catch (err) {
    console.log("Error while fetching cart products: ", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const user = req.user;

    const { productId } = req.body;
    const existingProduct = await user.cartItems.find(
      (item) => item.id === productId
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      user.cartItems.push({ productId, quantity: 1 });
    }

    console.log("User Cart:", user.cartItems);

    await user.save();
    res.status(200).json(user.cartItems);
  } catch (err) {
    res.status(500).json(err);
  }
};
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId) user.cartItems = [];
    else
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);

    await user.save();
    res.status(200).json(user.cartItems);
  } catch (err) {
    res.status(500).json(err);
  }
};
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingProduct = user.cartItems.find(
      (item) => item.id === productId
    );

    if (existingProduct) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.status(200).json(user.cartItems);
      } else {
        existingProduct.quantity = quantity;
        await user.save();
        return res.status(200).json(user.cartItems);
      }
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
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
