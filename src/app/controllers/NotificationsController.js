import Notification from '../schemas/notification'
import User from '../models/User'

class NotificationsController {
  async index (req, res) {
    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true }
    })
    if (!isProvider) {
      return res.status(400).json({ error: 'Apenas Providers' })
    }

    const notification = await Notification.find({
      user: req.userId
    }).sort('createdAt').limit(20)
    return res.json(notification)
  }
}
export default new NotificationsController()
