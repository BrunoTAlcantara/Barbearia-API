import Mail from '../../lib/Mail'
import pt from 'date-fns/locale/pt'
import { format, parseISO } from 'date-fns'

class CancellationMail {
  // get serve para pegar função , exemplo cancelationMail.key

  get key () {
    // chave unica cada job precisa de uma
    return 'CancellationMail'
  }

  // tarefa que vais executar quando esse processo for chamado , fila caso precisar de 10 emails
  async handle ({ data }) {
    const { appointment } = data
    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento Cancelado',
      text: 'Voce tem um novo cancelamento',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(parseISO(
          appointment.date),
        " 'dia' dd 'de' MMMM ', ás' H:mm 'h'",
        { locale: pt })
      }

    })
  }
}

export default new CancellationMail()
