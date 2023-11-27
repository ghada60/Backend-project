import createHttpError from 'http-errors'

import { Order } from '../models/orderModel'
import { OrderDocument } from '../types/types'

export const findAllOrders = async () => {
  const orders = await Order.find()
  return orders
}

export const findOrder = async (orderId: string) => {
  const order = await Order.findById(orderId)
  if (!order) {
    const error = createHttpError(404, `Order not found with the ID: ${orderId}`)
    throw error
  }
  return order
}

export const removeOrder = async (orderId: string) => {
  const order = await Order.findByIdAndDelete(orderId)
  if (!order) {
    const error = createHttpError(404, 'Order not found with the entered ID')
    throw error
  }
  return order
}

export const createNewOrder = async (newOrder: OrderDocument) => {
  const { user, orderDate, products, shippingInfo, orderStatus } = newOrder
  const order = await Order.create({
    user: user,
    orderDate: orderDate,
    products: products,
    shippingInfo: shippingInfo,
    orderStatus: orderStatus,
  })
  return order
}

export const changeOrderStatus = async (orderId: string, newStatus: string) => {
  findOrder(orderId)
  const order = await Order.findByIdAndUpdate(
    orderId,
    { $set: { orderStatus: newStatus } },
    { new: true })
  return order
}