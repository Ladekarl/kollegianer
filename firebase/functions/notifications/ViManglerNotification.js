'use strict';

const {
  buildNotification,
  getNotificationTokens,
  getValue,
  notifyOnWrite,
  publishNotification
} = require('./shared/NotificationHelper');

exports.ViManglerNotification = notifyOnWrite('/vimangler/{viManglerUid}', event => {
  const viManglerUid = event.params.viManglerUid;
  const viMangler = getValue(event);

  if (!viMangler) {
    console.log(viManglerUid, ' was deleted');
    return 0;
  }

  return publishNotification(event, (usersSnapshots, committingUid) =>
    getNotificationTokens(usersSnapshots,
      (userId, user) => user.duty === 'Indkøber' && user.notificationTokens && String(committingUid).valueOf() != String(userId).valueOf()
    ), (committingUser) => {
    const viManglerAdded = buildNotification('Der blev tilføjet en ting til Vi Mangler', `${viMangler.item} blev tilføjet af ${committingUser.room}`, 'fcm.VI_MANGLER');
    const viManglerChecked = buildNotification('Der blev købt en ting på Vi Mangler', `${viMangler.item} blev købt af ${committingUser.room}`, 'fcm.VI_MANGLER');
    return viMangler.checked ? viManglerChecked : viManglerAdded;
  });
});