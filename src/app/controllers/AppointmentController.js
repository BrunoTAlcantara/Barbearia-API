import Appointment from '../models/Appointment'
import User from '../models/User'
import File from '../models/File'
import Notification from '../schemas/notification'
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns'
import pt from 'date-fns/locale/pt'
import Queue from '../../lib/Queue'
import CancellationMail from '../jobs/CancellationMail'
import * as Yup from 'yup'
class AppointmentController {
  async index (req, res) {
    const { page = 1 } = req.query
    const appointment = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'date', 'canceable', 'past'],
      include: [{
        model: User,
        as: 'provider',
        attributes: ['name', 'id'],
        include: [{
          model: File,
          attributes: ['id', 'url', 'path']
        }]
      }]
    })
    return res.json(appointment)
  }

  async store (req, res) {
    const shema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    })
    if (!(await shema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validçao falhou' })
    }
    const { provider_id, date } = req.body

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    })
    if (!isProvider) {
      return res.status(400).json({ error: 'Apenas Providers' })
    }
    if (provider_id === req.userId) {
      return res.status(400).json({ error: 'Providers nao pode ser o mesmo do user' })
    }
    const hourStart = startOfHour(parseISO(date))

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Data nao permitida' })
    }
    const checkAvalaibity = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    })

    if (checkAvalaibity) {
      return res.status(400).json({ error: 'Apenas Providers' })
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart

    })

    /**
     * Notify provider
     */
    const user = await User.findByPk(req.userId)
    const formatDate = format(
      hourStart,
      " 'dia' dd 'de' MMMM ', ás' H:mm 'h'",
      { locale: pt }
    )
    await Notification.create({
      content: `Novo agendamento de  ${user.name} para o dia ${formatDate}`,
      user: provider_id
    })

    return res.json(appointment)
  }

  async delete (req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'provider',
        attributes: ['name', 'email']
      },
      {
        model: User,
        as: 'user',
        attributes: ['name']
      }
      ]
    })

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'Voce nao tem permissão para cancelar o agendamento'
      })
    }
    const dateWidhtSub = subHours(appointment.date, 2)

    if (isBefore(dateWidhtSub, new Date())) {
      return res.status(401).json({
        error: 'So pode cancelar 2 h antes'
      })
    }

    appointment.canceled_at = new Date()

    await appointment.save()

    await Queue.add(CancellationMail.key, {
      appointment
    })

    return res.json(appointment)
  }
}
export default new AppointmentController()
