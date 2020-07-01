import * as Yup from 'yup';

class UserValidation {
  async create(req, res, next) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    return next();
  }

  async edit(req, res, next) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      old_password: Yup.string(),
      password: Yup.string().when('old_password', (old_password, field) =>
        old_password ? field.required().min(6) : field
      ),
      confirm_password: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([password]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    return next();
  }
}

export default new UserValidation();
