import * as Yup from 'yup';

class AppointmentValidation {
  async create(req, res, next) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation invalid' });
    }

    return next();
  }
}

export default new AppointmentValidation();
