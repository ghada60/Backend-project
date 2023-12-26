import express from 'express'
import { config } from 'dotenv'
import { databaseConnection } from './database/db'
import apiErrorHandler from './middlewares/errorHandler'
import myLogger from './middlewares/logger'
import cors, { CorsOptions } from 'cors'
import usersRouter from './routers/usersRoute'
import authRouter from './routers/authRoute'
import categoryRouter from './routers/categoriesRoute'
import cartRouter from './routers/cartRoute'
import productsRouter from './routers/productsRoute'
import wishListRouter from './routers/wishListRoute'
import discountCodeRouter from './routers/discountCodeRoute'
import passwordRouter from './routers/passwordRoute'
import reviewRouter from './routers/reviewRoute'
import ordersRouter from './routers/ordersRoute'
import dotenv from 'dotenv'
dotenv.config()
const app = express()
const PORT = process.env.Port || 5050
const environment = process.env.ENVNODE_ENV || 'development'
const whitelist = ['myownfrontenddomin.com']
if (environment === 'development') {
  whitelist.push('http://localhost:3000')
}
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    const isOriginAllowed = origin && whitelist.indexOf(origin) !== -1
    if (isOriginAllowed) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}
app.use(cors())
// app.use(myLogger)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/wishlist', wishListRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/reset-password', passwordRouter)
app.use('/api/products', productsRouter)
app.use('/api/discount-code', discountCodeRouter)
app.use('/api/reviews', reviewRouter)

app.use(apiErrorHandler)

databaseConnection()

app.listen(PORT, () => {
  console.log('Server running http://localhost:' + PORT)
})
export default app
