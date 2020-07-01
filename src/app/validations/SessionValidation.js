import * as Yup from 'yup';

class SesssionValidation {
  async create(req, res, next) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validations faild' });
    }

    return next();
  }
}

export default new SesssionValidation();
