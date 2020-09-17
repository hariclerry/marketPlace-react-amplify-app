import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
// import Amplify, { Auth, Hub } from "aws-amplify";
import Amplify, { API, graphqlOperation, Auth, Hub } from "aws-amplify";
import { getUser } from "./graphql/queries";
import { registerUser } from "./graphql/mutations";
import createBrowserHistory from "history/createBrowserHistory";
import {
  AmplifyAuthenticator,
  AmplifySignUp,
  AmplifySignIn,
} from "@aws-amplify/ui-react";

import HomePage from "pages/HomePage";
import MarketPage from "pages/MarketPage";
import ProfilePage from "pages/ProfilePage";
import Navbar from "components/Navbar";

import awsconfig from "./aws-exports";
import "./App.css";

Amplify.configure(awsconfig);

export const UserContext = React.createContext();
export const history = createBrowserHistory();

class App extends React.Component {
  state = {
    user: null,
    userAttributes: null,
  };

  componentDidMount() {
    this.getUserData();
    Hub.listen("auth", this, "onHubCapsule");
  }

  getUserData = async () => {
    const user = await Auth.currentAuthenticatedUser();
    user
      ? this.setState({ user }, () => this.getUserAttributes(this.state.user))
      : this.setState({ user: null });
  };

  getUserAttributes = async (authUserData) => {
    const attributesArr = await Auth.userAttributes(authUserData);
    const attributesObj = Auth.attributesToObject(attributesArr);
    this.setState({ userAttributes: attributesObj });
  };

  onHubCapsule = (capsule) => {
    switch (capsule.payload.event) {
      case "signIn":
        console.log("signed in");
        this.getUserData();
        this.registerNewUser(capsule.payload.data);
        break;
      case "signUp":
        console.log("signed up");
        break;
      case "signOut":
        this.setState({ user: null });
        break;
      default:
        return;
    }
  };

  registerNewUser = async (signInData) => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub,
    };
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));
    // if we can't get a user (meaning the user hasn't been registered before), then we execute registerUser
    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true,
        };
        const newUser = await API.graphql(
          graphqlOperation(registerUser, { input: registerUserInput })
        );
        console.log({ newUser });
      } catch (err) {
        console.error("Error registering new user", err);
      }
    }
  };

  handleSignout = async () => {
    try {
      await Auth.signOut();
    } catch (err) {
      console.error("Error signing out user", err);
    }
  };
  renderText = () => (<div><p>Signup for AmplifyKatale</p><p>You can use <a href="https://10minutemail.com/">https://10minutemail.com</a>to use a fake email</p></div>)
  render() {
    const { user, userAttributes } = this.state;
    return !user ? (
      <AmplifyAuthenticator>
        <AmplifySignIn
          headerText="Sign in into your AmplifyKatale account"
          slot="sign-in"
        ></AmplifySignIn>
        <AmplifySignUp
          slot="sign-up"
          formFields={[
            { type: "username" },
            { type: "password" },
            { type: "email" },
          ]}
          headerText="Sign Up for AmplifyKatale"
        />
      </AmplifyAuthenticator>
    ) : (
      <UserContext.Provider value={{ user, userAttributes }}>
        <Router history={history}>
          <>
            {/* Navigation */}
            <Navbar user={user} handleSignout={this.handleSignout} />

            {/* Routes */}
            <div className="app-container">
              <Route
                exact
                path="/"
                component={() => (
                  <HomePage user={user} />
                )}
              />
              <Route
                path="/profile"
                component={() => (
                  <ProfilePage user={user} userAttributes={userAttributes} />
                )}
              />
              <Route
                path="/markets/:marketId"
                component={({ match }) => (
                  <MarketPage
                    user={user}
                    marketId={match.params.marketId}
                    userAttributes={userAttributes}
                  />
                )}
              />
            </div>
          </>
        </Router>
      </UserContext.Provider>
    );
  }
}
export default App;
