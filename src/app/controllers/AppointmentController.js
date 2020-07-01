import { isBefore, parseISO, startOfHour, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Notification from '../schemas/Notification';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      limit: 10,
      offset: (page - 1) * 10,
      attributes: ['id', 'date'],
      order: [['date', 'DESC']],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const { provider_id, date } = req.body;

    // check if  user is provider
    const isProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointment with provider' });
    }

    if (isProvider.id === req.userId) {
      return res
        .status(401)
        .json({ error: 'You can only create  appointment to other users' });
    }

    //  date conveted in Iso formated in to hour start
    const hourStart = startOfHour(parseISO(date));

    // check if past dates
    if (isBefore(hourStart, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' });
    }

    // check if availability
    const dateOccupied = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (dateOccupied) {
      return res.status(401).json({ error: 'Date are not available' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    // notify provider
    const { name } = await User.findByPk(req.userId);
    const dateFormatted = format(
      hourStart,
      "'dia' dd 'de' MMMM, 'às' H:mm'h'",
      { locale: pt }
    );

    Notification.create({
      content: `Novo agendameto de ${name} para ${dateFormatted}`,
      user: provider_id,
    });

    return res.status(201).json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You d'ont have permission to cancel this appointment",
      });
    }

    const dateWithHourSub = subHours(appointment.date, 2);

    if (isBefore(dateWithHourSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointments 2 hours in advance.',
      });
    }

    appointment.canceled_at = new Date();
    await appointment.save();
    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
