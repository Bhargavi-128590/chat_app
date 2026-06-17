const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  sender,
  title,
  body,
}) => {
 return await Notification.create({
  receiver: recipient,
  sender,
  title,
  body,
});
};

module.exports = {
  createNotification,
};