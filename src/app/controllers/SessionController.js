import JWT from 'jsonwebtoken'
import auth from '../../config/authToken'
import User from '../models/User'

class SessionController {
  async store (req, res) {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({ error: 'User nao existe' })
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password nao existe' })
    }

    const { id, name } = user

    return res.json({
      user: {
        id, name, email
      },
      token: JWT.sign({ id }, auth.secret, {
        expiresIn: auth.expiresIn
      })
    })
  }
}

export default new SessionController()
