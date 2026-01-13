import Product from "../models/product.model.js";
import ProductVariation from "../models/productVariation.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.cartItems || user.cartItems.length === 0) {
      return res.status(200).json({ cartItems: [] });
    }

    // Fetch all products referenced in the cart
    const products = await Product.find({
      _id: { $in: user.cartItems.map((item) => item.productId) },
    })
      .populate({
        path: "variations", // Populate the variations array
        model: "ProductVariation",
      })
      .populate({
        path: "defaultVariation", // Populate the default variation
        model: "ProductVariation",
      });

    // Map each cart item to include product and variation details
    const cartProducts = user.cartItems
      .map((cartItem) => {
        // Find the product associated with this cart item
        const product = products.find((p) => p._id.equals(cartItem.productId));

        if (!product) {
          return null; // Skip if product not found
        }

        // Find the selected variation for this cart item
        const variation = product.variations.find((v) =>
          v._id.equals(cartItem.variationId)
        );

        if (!variation) {
          return null; // Skip if variation not found
        }

        // Return the product with only the selected variation
        return {
          ...product.toJSON(), // Include product details
          variations: [variation], // Include only the selected variation
          quantity: cartItem.quantity, // Include the quantity from the cart
          selectedVariation: variation._id, // Include the selected variation ID
        };
      })
      .filter(Boolean); // Remove null values
    console.log("Cart products: ", cartProducts);

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

    if (!productId || !variationId) {
      return res
        .status(400)
        .json({ message: "Product ID and variation ID are required." });
    }

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
    ); // check total quantity to be added to cart and available stock
    const totalQuantity = existingItem
      ? existingItem?.quantity + quantity
      : quantity;

    // Check if the requested quantity is greater than the available stock
    if (totalQuantity > productVariation.quantity) {
      return res.status(400).json({
        success: false,
        message: `You can only add up to ${productVariation.quantity} of this variation to your cart.`,
      });
    }
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
    console.log("Error in addToCart controller", error.message, error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId, variationId } = req.body; // Include variationId
    const user = req.user;

    console.log("User in removeAllFromCart: ", user);
    console.log("Product ID in removeAllFromCart: ", productId);
    console.log("Variation ID in removeAllFromCart: ", variationId);

    if (!productId) {
      // If no productId is provided, clear the entire cart
      user.cartItems = [];
    } else if (!variationId) {
      // If no variationId is provided, remove all items with the given productId
      user.cartItems = user.cartItems.filter(
        (item) => item.productId.toString() !== productId
      );
    } else {
      // Remove the specific variation of the product
      user.cartItems = user.cartItems.filter(
        (item) =>
          !(
            item.productId.toString() === productId &&
            item.variationId.toString() === variationId
          )
      );
    }

    await user.save();
    res.status(200).json(user.cartItems);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { variationId, quantity } = req.body; // Include variationId
    const user = req.user;

    console.log("User in updateQuantity: ", user);
    console.log("Product ID in updateQuantity: ", productId);
    console.log("Variation ID in updateQuantity: ", variationId);
    console.log("Quantity in updateQuantity: ", quantity);

    // Find the specific variation of the product in the cart
    const existingProduct = user.cartItems.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variationId.toString() === variationId
    );

    if (existingProduct) {
      if (quantity === 0) {
        // If quantity is 0, remove the item from the cart
        user.cartItems = user.cartItems.filter(
          (item) =>
            !(
              item.productId.toString() === productId &&
              item.variationId.toString() === variationId
            )
        );
      } else {
        // Update the quantity of the specific variation
        existingProduct.quantity = quantity;
      }

      await user.save();
      return res.status(200).json(user.cartItems);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (err) {
    console.log("Error while updating product quantity:  ", err);
    res.status(500).json(err);
  }
};
