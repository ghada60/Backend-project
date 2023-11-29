import { NextFunction, Request, Response } from 'express'

import {
  changeOrderStatus,
  createNewOrder,
  findAllOrders,
  findOrder,
  findOrderHistory,
  removeOrder,
} from '../services/orderService'
import ApiError from '../errors/ApiError'
import { sendEmail } from '../utils/sendEmail'
import { OrderStatus } from '../enums/enums'

/**-----------------------------------------------
 * @desc Get All Orders
 * @route /api/orders
 * @method GET
 * @access private (admin Only)
 -----------------------------------------------*/
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pageNumber = Number(req.query.pageNumber)
    const limit = Number(req.query.limit)
    const user = req.query.user?.toString()
    const status = req.query.status?.toString()

    const { orders, totalPages, currentPage } = await findAllOrders(
      pageNumber,
      limit,
      user,
      status
    )
    console.log(orders)

    res
      .status(200)
      .json({ message: 'All orders returned', payload: orders, totalPages, currentPage })
  } catch (error) {
    next(ApiError.badRequest('Something went wrong'))
  }
}

/**-----------------------------------------------
 * @desc Get Order By ID
 * @route /api/orders/:orderId
 * @method GET
 * @access private (admin and user)
 -----------------------------------------------*/
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await findOrder(req.params.orderId)
    res.status(200).json({ message: 'Single order returned successfully', payload: order })
  } catch (error) {
    next(ApiError.badRequest('Something went wrong'))
  }
}

/**-----------------------------------------------
 * @desc Create Order By ID
 * @route /api/orders
 * @method POST
 * @access public
 -----------------------------------------------*/
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.decodedUser.email

    const order = await createNewOrder(req.body)
    const subject = 'We have received your order'
    const htmlTemplate = `
        <div style="color: #333; text-align: center;">
          <h1 style="color: #1E1E1E;">Thanks for your purchase</h1>
         <p>We'll prepare your order for immediate dispatch and you will recive it shortly. We'll email you the shiping confirmation once your order is on its way.</p>
          <p style="font-size: 14px; color: #302B2E;">Black Tigers Team</p>
        </div>
      `
    await sendEmail(email, subject, htmlTemplate)
    res.status(201).json({ meassge: 'Order has been created successfuly', payload: order })
  } catch (error) {
    next(ApiError.badRequest('Something went wrong'))
  }
}

/**-----------------------------------------------
 * @desc Delete Order By ID
 * @route /api/orders/:orderId
 * @method DELETE
 * @access private (admin Only)
 -----------------------------------------------*/
export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await removeOrder(req.params.orderId)
    res.status(200).json({ meassge: 'Order has been deleted Successfully', result: order })
  } catch (error) {
    next(ApiError.badRequest('Something went wrong'))
  }
}

/**-----------------------------------------------
 * @desc Update Order By ID
 * @route /api/orders/:orderId
 * @method PUT
 * @access private (admin Only)
 -----------------------------------------------*/
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderStatus } = req.body
    const updatedOrder = await changeOrderStatus(req.params.orderId, orderStatus)
    res.status(200).json({
      message: 'Category has been updated successfully',
      payload: updatedOrder,
    })
  } catch (error) {
    next(ApiError.badRequest('Something went wrong'))
  }
}

/**-----------------------------------------------
 * @desc Get Order History
 * @route /api/orders/history
 * @method GET
 * @access private (admin Only)
 -----------------------------------------------*/
export const getOrderHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.decodedUser
    const orderHistory = await findOrderHistory(userId)

    res.json({ message: 'Order History returned successfully', payload: orderHistory })
  } catch (error) {
    next(ApiError.badRequest('Something went wrong'))
  }
}

/**-----------------------------------------------
 * @desc return order
 * @route /api/orders/:orderId/return
 * @method POST
 * @access private 
 -----------------------------------------------*/
export const returnOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.orderId
    const order = await findOrder(orderId)
    if (order.orderStatus !== OrderStatus.DELIVERED) {
      return next(ApiError.badRequest('Order cannot be returned as it has not been delivered yet'))
    }
    const returnDeadline = new Date(order.orderDate)
    returnDeadline.setDate(returnDeadline.getDate() + 7)

    const currentDate = new Date()
    if (currentDate > returnDeadline) {
      return next(
        ApiError.badRequest('The order has exceeded the return time limit and cannot be returned')
      )
    }
    const returnedOrder = await changeOrderStatus(orderId, OrderStatus.RETURNED)

    res
      .status(200)
      .json({ message: 'Order has been returned successfully', payload: returnedOrder })
  } catch (error) {
    next(ApiError.badRequest('Something went wrong'))
  }
}
