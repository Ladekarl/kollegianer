import {NavigationActions, StackActions} from 'react-navigation';

export const navigate = (navigator, firstRouteName, secondRouteName) => {
    navigator.dispatch(NavigationActions.navigate({
        routeName: firstRouteName,
        params: {
            action: secondRouteName
        }
    }));
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


export const navigateAndReset = (navigator, routeName, nested) => {
    let resetAction = StackActions.reset({
        index: 0,
        key: nested ? null : undefined,
        actions: [NavigationActions.navigate({routeName: routeName})],
    });
    navigator.dispatch(resetAction);
};