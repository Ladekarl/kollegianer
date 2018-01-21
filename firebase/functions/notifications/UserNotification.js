'use strict';

const {
  buildNotification,
  getPreviousValue,
  getValue,
  notifyOn,
  publishNotification
} = require('./shared/NotificationHelper');

exports.sendUserUpdatedNotification = notifyOn('/user/{userUid}').onUpdate(event => {
  const userUid = event.params.userUid;
  const user = getValue(event);
  const previousUser = getPreviousValue(event);

  if (!user) {
    return console.log(userUid, ' was deleted');
  }

  return publishNotification(event, () => {
      let notificationTokens = [];
      if (user.notificationToken && ((!previousUser.kitchenweek && user.kitchenweek) || (!previousUser.sheriff && user.sheriff))) {
        notificationTokens.push(user.notificationToken);
      }
      return notificationTokens;
    }, (committingUser) => {
      const kitchenWeekUpdated = buildNotification('Du har nu køkkenugen', `${committingUser.room} gav dig køkkenugen`, 'fcm.KITCHEN_WEEK');
      const sheriffUpdated = buildNotification('Du er nu sheriff', `${committingUser.room} gjorde dig til sheriff`, 'fcm.SHERIFF');
      return user.kitchenweek ? kitchenWeekUpdated : sheriffUpdated;
    }
  );
});