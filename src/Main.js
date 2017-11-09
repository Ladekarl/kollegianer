import {StackNavigator} from 'react-navigation'
import LoginScreen from "./containers/Login";
import HomeScreen from "./containers/Home";

export default MainNavigator = StackNavigator({
  Login: {screen: LoginScreen},
  Home: {screen: HomeScreen},
  initialRouteName: {screen: LoginScreen}
});