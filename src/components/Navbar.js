import React from "react";
import { Menu as Nav, Button } from "element-react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";

import AppIcon from "../assests/app-icon.png";

const Navbar = ({ user, handleSignout }) => (
  <Nav mode="horizontal" theme="dark" defaultActive="1">
    <div className="nav-container">
      {/* App Title / Icon */}
      <Nav.Item index="1">
        <NavLink to="/" className="nav-link">
          <span className="app-title">
            <img src={AppIcon} alt="App Icon" className="app-icon" />
            AmplifyKatale
          </span>
        </NavLink>
      </Nav.Item>

      {/* Navbar Items */}
      <div className="nav-items">
        <Nav.Item index="2">
          <span className="app-user">Hello, {user.username}</span>
        </Nav.Item>
        <Nav.Item index="3">
          <NavLink to="/profile" className="nav-link">
            <FontAwesomeIcon
              icon={faUser}
              size="lg"
              style={{ paddingRight: "5px" }}
            />
            Profile
          </NavLink>
        </Nav.Item>
        <Nav.Item index="4">
          <Button type="warning" onClick={handleSignout}>
            Sign Out
          </Button>
        </Nav.Item>
      </div>
    </div>
  </Nav>
);

export default Navbar;
