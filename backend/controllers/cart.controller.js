import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        const user = req.user;
        
        const productIds = user.cartItems.map(item => item.product);
        
        const products = await Product.find({ _id: { $in: productIds } });

        const cartItems = products.map(product => {
            const cartItem = user.cartItems.find(item => 
                item.product.toString() === product._id.toString()
            );
            return {
                ...product.toJSON(),
                quantity: cartItem ? cartItem.quantity : 1
            };
        });

        res.json(cartItems);
    } catch (error) {
        console.log("Error in get cart items Controller", error.message);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;


		const existingItem = user.cartItems.find(
        (item) => item?.product?.toString() === productId);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push({
        product: productId,
        quantity: 1,
      });
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in addToCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const removeFromCart = async (req, res) => {
	try {
		const { id : productId} = req.params; 
		const user = req.user;
		user.cartItems = user.cartItems.filter(
			(item) => item.product.toString() !== productId
		);
		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in removeFromCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params
		const { quantity } = req.body;
		const user = req.user;
		const existingItem = user.cartItems.find((item) => item.product.toString() === productId);

		if (existingItem) {
			if (quantity === 0) {
				user.cartItems = user.cartItems.filter((item) => item.product.toString() !== productId);
				await user.save();
				return res.json(user.cartItems);
			}

			existingItem.quantity = quantity;
			await user.save();
			res.json(user.cartItems);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in updateQuantity controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
