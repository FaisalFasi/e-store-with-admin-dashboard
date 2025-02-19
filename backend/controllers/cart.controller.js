import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;

    const prodducts = await Product.find({
      // $in is a MongoDB operator that selects the documents where the value of a field equals any value in the specified array
      _id: { $in: user.cartItems },
    })
      .populate({
        path: "variations", // Field to populate
        model: "ProductVariation", // Name of the model you want to populate with
      })
      .populate({
        path: "defaultVariation",
        model: "ProductVariation",
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
    const { productId, variationId } = req.body; // Get variationId from request

    const user = req.user;

    if (!productId || !variationId) {
      return res
        .status(400)
        .json({ message: "Product ID and variation ID are required." });
    }
    console.log("User:", user);

    // Find existing item in the cart based on both productId and variationId
    const existingItem = user.cartItems.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variationId.toString() === variationId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({
        productId,
        variationId,
        quantity: 1,
      });
    }

    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
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
