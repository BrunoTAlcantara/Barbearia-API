import jwt from 'jsonwebtoken'
import { promisify } from 'util'

import authConfig from '../../config/authToken'

export default async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.json(401).json({ error: 'token nao e igual' })
  }
  const [, token] = authHeader.split(' ')

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret)

    req.userId = decoded.id

    return next()
  } catch (err) {
    return res.json(401).send({ error: 'token nao e igual' })
  }
}
