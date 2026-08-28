import { getDashboard } from "../services/admin.service.js";
import { getDashboardDate } from "../validators/admin.validator.js";

const dashboard = async (req, res, next) => {
  try {
    const selectedDate = getDashboardDate(req.query.date);
    const result = await getDashboard({ date: selectedDate.date });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export { dashboard };