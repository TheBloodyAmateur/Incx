import { useState } from "react";
import "./SimpleNav.css";

const SimpleNav = ({ onDevModeToggle, devMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="simple-nav-container">
      <nav className={`simple-nav ${isOpen ? "open" : ""}`}>
        <div className="simple-nav-top">
          <div
            className={`hamburger-menu ${isOpen ? "open" : ""}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            tabIndex={0}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <span className="nav-title">Settings</span>
        </div>

        {isOpen && (
          <div className="simple-nav-content">
            <div className="nav-toggle-item">
              <span className="toggle-label">Dev-Mode</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={devMode}
                  onChange={(e) => onDevModeToggle(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default SimpleNav;
