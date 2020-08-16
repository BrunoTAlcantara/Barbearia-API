import Appointment from '../models/Appointment'
import User from '../models/User'
import { startOfDay, endOfDay, parseISO } from 'date-fns'
import { Op } from 'sequelize'

class SheduleController {
  async index (req, res) {
    const CheckUserProvider = User.findOne({
      where: { id: req.userId, provider: true }
    })
    if (!CheckUserProvider) {
      return res.status(401).json({ error: 'O usario nao e provider' })
    }
    const { date } = req.query
    const parseDate = parseISO(date)

    const appointments = Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [
            startOfDay(parseDate),
            endOfDay(parseDate)
          ]

        },
        order: ['date']
      }
    })

    return res.json(appointments)
  }
}
export default new SheduleController()
