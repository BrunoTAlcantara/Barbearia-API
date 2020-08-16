import { Op } from 'sequelize'
import { startOfDay, endOfDay, setSeconds, setHours, setMinutes, format, isAfter } from 'date-fns'
import Appointment from '../models/Appointment'

class AvaliableController {
  async index (req, res) {
    const { date } = req.query
    if (!date) {
      return res.status(400).json({ error: 'invalid date' })
    }
    const serachDate = Number(date)
    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [
            startOfDay(serachDate),
            endOfDay(serachDate)
          ]

        }
      }
    })

    const schedule = [
      '09:00',
      '10:00',
      '11:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00'
    ]
    const avaliable = schedule.map(time => {
      const [hour, minute] = time.split(':')
      const value = setSeconds(setMinutes(setHours(serachDate, hour), minute), 0)

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        avaliable: isAfter(value, new Date() && !appointments.find(appo =>
          format(appo.date, 'HH:mm') === time
        ))
      }
    })

    return res.json(avaliable)
  }
}

export default new AvaliableController()
