import Product from "../models/product.model.js";
import ProductVariation from "../models/productVariation.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.cartItems || user.cartItems.length === 0) {
      return res.status(200).json({ cartItems: [] });
    }

    const productIds = user.cartItems.map((item) => item.productId);

    const products = await Product.find({
      // $in is a MongoDB operator that selects the documents where the value of a field equals any value in the specified array
      _id: { $in: productIds },
    })
      .populate({
        path: "variations", // Field to populate
        model: "ProductVariation", // Name of the model you want to populate with
      })
      .populate({
        path: "defaultVariation",
        model: "ProductVariation",
      });

    // Map products to include cart quantities
    const cartProducts = products.map((product) => {
      // Find the matching cart item for this product
      const cartItem = user.cartItems.find(
        (item) => item.productId.toString() === product._id.toString()
      );

      return {
        ...product.toJSON(),
        quantity: cartItem ? cartItem.quantity : 1, // Default to 1 if somehow not found
        selectedVariation: cartItem ? cartItem.variationId : null, // Optional: return variation info
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
    const { productId, variationId, quantity } = req.body; // Get variationId from request

    const user = req.user;

    console.log("productId in addToCart: ", productId);
    console.log("variationId in addToCart: ", variationId);

    if (!productId || !variationId) {
      return res
        .status(400)
        .json({ message: "Product ID and variation ID are required." });
    }
    console.log("User:", user);

    const productVariation = await ProductVariation.findOne({
      _id: variationId,
      productId,
    });

    if (!productVariation) {
      return res.status(404).json({ message: "Product variation not found." });
    }

    // Find existing item in the cart based on both productId and variationId
    const existingItem = user.cartItems.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variationId.toString() === variationId
    );

    console.log("Product variation in addToCart:", productVariation.quantity);
    // check total quantity to be added to cart and available stock
    const totalQuantity = existingItem.quantity + quantity;
    console.log("Total quantity in addToCart:", totalQuantity);

    // Check if the requested quantity is greater than the available stock
    if (totalQuantity > productVariation.quantity) {
      return res.status(400).json({
        success: false,
        message: `You can only add up to ${productVariation.quantity} of this variation to your cart.`,
      });
    }
    console.log("Existing item in addToCart:", existingItem);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cartItems.push({
        productId,
        variationId,
        quantity: quantity,
      });
    }

    await user.save();
    res.status(200).json({ success: true, cartItem: user.cartItems });
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

    console.log("User in updateQuantity: ", user);
    console.log("Product ID in updateQuantity: ", productId);
    console.log("Quantity in updateQuantity: ", quantity);

    const existingProduct = user.cartItems.find(
      (item) => item.productId.toString() === productId
    );
    console.log("productId in productId: ", productId);

    if (existingProduct) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.productId.toString() !== productId
        );
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
