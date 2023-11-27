import createHttpError from 'http-errors'

import { Cart } from '../models/cartModel'
import { CartDocument, UserDocument, ProductDocument } from '../types/types'
import { Product } from '../models/productModel'

export const createCart = async (user: UserDocument): Promise<CartDocument> => {
  let cart = await Cart.findOne({ user: user })
  if (!cart) {
    cart = await Cart.create({ user: user, products: [] })
  }
  return cart
}

export const checkStock = async (product: ProductDocument, quantity: number) => {
  if (product.quantityInStock === 0) {
    const error = createHttpError(404, `Product is currently out of stock`)
    throw error
  }
  if (quantity > product.quantityInStock) {
    const error = createHttpError(404, `Quantity requested exceeds quantity available in stock.`)
    throw error
  }
}

export const addItem = async (
  cart: CartDocument,
  quantity: number,
  product: ProductDocument
): Promise<CartDocument> => {
  // Check if the product is already in the cart
  const existingCartItem = cart.products.find((p) => p.product.toString() === product._id.toString());

  // If the product is already in the cart, increment the quantity
  if (existingCartItem) {
    existingCartItem.quantity += quantity;
  } else {
    // If the product is not in the cart, add a new entry
    cart.products.push({ product: product._id, quantity: quantity });
  }

  // Save the cart to the database asynchronously
  await cart.save();

  // Return the updated cart
  return cart;
};

export const calculateTotalPrice = async (cart: CartDocument): Promise<number> => {
  const total = await Promise.all(
    cart.products.map(async (product) => {
      try {
        const productFound = await Product.findById(product.product);
        const productPrice = productFound?.productPrice || 1;
        return productPrice * product.quantity;
      } catch (error) {
        console.error(`Error fetching product: ${error}`);
        return 0; // Default to 0 in case of an error
      }
    })
  );
  const totalPrice = total.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  console.log(totalPrice);
  return totalPrice;
};

export const updateQuantityInStock = async (productId: string, quantityInStock: number) => {
  await Product.findByIdAndUpdate(
    productId,
    { $set: { quantityInStock: quantityInStock-1} },
    { new: true }
  )
}

export const findCart = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId }).populate('products.product')
  if (!cart) {
    const error = createHttpError(404, `Cart not found with userId: ${userId}`)
    throw error
  }
  return cart.products
}

export const updateCart = async (userId: string, cartItemId: string, quantity: number) => {
  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId, 'products._id': cartItemId },
      { $set: { 'products.$.quantity': quantity } },
      { new: true }
    )

    if (!updatedCart) {
      const error = new Error('Cart or product not found')
      throw error
    }

    const itemsCount = updatedCart.products.reduce((count, product) => count + product.quantity, 0)
    return { cart: updatedCart, itemsCount }
  } catch (error) {
    throw new Error('Failed to update cart item')
  }
}