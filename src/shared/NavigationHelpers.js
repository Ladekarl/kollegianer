import {CommonActions} from '@react-navigation/native';

export const navigate = (navigator, firstRouteName, secondRouteName) => {
  navigator.dispatch(
    CommonActions.navigate({
      name: firstRouteName,
      params: {},
      action: secondRouteName
        ? CommonActions.navigate({
            name: secondRouteName,
          })
        : undefined,
    }),
  );
};

export const navigateOnNotification = (navigator, notification) => {
  const action = notification.data.action;
  switch (action) {
    case 'fcm.VI_MANGLER':
      navigate(navigator, 'Home', 'ViMangler');
      break;
    case 'fcm.GOSSIP':
      navigate(navigator, 'Home', 'Gossip');
      break;
    case 'fcm.ACCOUNTING':
      navigate(navigator, 'Home', 'Regnskab');
      break;
  }
};

export const navigateAndReset = (
  navigator,
  routeName,
  nested,
  secondRouteName,
) => {
  let resetAction = CommonActions.reset({
    index: 0,
    key: nested ? null : undefined,
    routes: [{name: routeName}],
  });
  navigator.dispatch(resetAction);
};
