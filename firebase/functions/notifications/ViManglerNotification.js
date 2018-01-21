'use strict';

const {
  buildNotification,
  getNotificationTokens,
  getValue,
  notifyOn,
  publishNotification
} = require('./shared/NotificationHelper');

exports.sendViManglerNotification = notifyOn('/vimangler/{viManglerUid}').onWrite(event => {
  const viManglerUid = event.params.viManglerUid;
  const viMangler = getValue(event);

  if (!viMangler) {
    return console.log(viManglerUid, ' was deleted');
  }

  return publishNotification(event, (usersSnapshots) =>
    getNotificationTokens(usersSnapshots,
      (userId, user) => user.duty === 'Indkøber' && user.notificationToken
    ), (committingUser) => {
    const viManglerAdded = buildNotification('Der blev tilføjet en ting til Vi Mangler', `${viMangler.item} blev tilføjet af ${committingUser.room}`, 'fcm.VI_MANGLER');
    const viManglerChecked = buildNotification('Der blev købt en ting på Vi Mangler', `${viMangler.item} blev købt af ${committingUser.room}`, 'fcm.VI_MANGLER');
    return viMangler.checked ? viManglerChecked : viManglerAdded;
  });
});