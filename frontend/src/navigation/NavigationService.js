// src/navigation/NavigationService.js
import { CommonActions, StackActions } from '@react-navigation/native';

let navigator;

const setTopLevelNavigator = (navigatorRef) => {
    navigator = navigatorRef;
};

const navigate = (routeName, params) => {
    navigator?.dispatch(
        CommonActions.navigate({
            name: routeName,
            params,
        })
    );
};

const push = (routeName, params) => {
    navigator?.dispatch(StackActions.push(routeName, params));
};

const goBack = () => {
    navigator?.dispatch(CommonActions.goBack());
};

const reset = (routes, index = 0) => {
    navigator?.dispatch(
        CommonActions.reset({
            index,
            routes,
        })
    );
};

const replace = (routeName, params) => {
    navigator?.dispatch(StackActions.replace(routeName, params));
};

const popToTop = () => {
    navigator?.dispatch(StackActions.popToTop());
};

export default {
    setTopLevelNavigator,
    navigate,
    push,
    goBack,
    reset,
    replace,
    popToTop,
};