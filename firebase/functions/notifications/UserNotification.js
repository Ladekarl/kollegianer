'use strict';

const {
  buildNotification,
  getPreviousValue,
  getValue,
  notifyOnUpdate,
  publishNotification
} = require('./shared/NotificationHelper');

exports.UserUpdatedNotification = notifyOnUpdate('/user/{userUid}', event => {
  const userUid = event.params.userUid;
  const user = getValue(event);
  const previousUser = getPreviousValue(event);

  if (!user) {
    console.log(userUid, ' was deleted');
    return 0;
  }

  return publishNotification(event, () => {
      let notificationTokens = [];
      if (user.notificationTokens && ((!previousUser.kitchenweek && user.kitchenweek) || (!previousUser.sheriff && user.sheriff))) {
        notificationTokens = notificationTokens.concat(user.notificationTokens);
      }
      return notificationTokens;
    }, (committingUser) => {
      return user.kitchenweek ?
        buildNotification('Du har nu køkkenugen', `${committingUser.room} gav dig køkkenugen`, 'fcm.KITCHEN_WEEK') :
        buildNotification('Du er nu sheriff', `${committingUser.room} gjorde dig til sheriff`, 'fcm.SHERIFF');
    }
  );
});