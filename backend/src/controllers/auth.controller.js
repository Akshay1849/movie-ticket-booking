import { login, registerCustomer } from "../services/auth.service.js";
import { validateCredentials, validateRegistration } from "../validators/auth.validator.js";

const register = async (req, res, next) => {
  try {
    const credentials = validateRegistration(req.body);
    const user = await registerCustomer(credentials);

    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const credentials = validateCredentials(req.body);
    const result = await login(credentials);

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getMe = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

export { getMe, loginUser, register };