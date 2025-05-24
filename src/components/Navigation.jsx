// client/src/components/Navigation.js
import React from "react";
import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { Link, NavLink, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  const navStyle = {
    background:
      "linear-gradient(135deg, #ff8c00 0%, #ff7700 50%, #ff6600 100%)",
    boxShadow: "0 2px 10px rgba(255, 140, 0, 0.3)",
    borderBottom: "3px solid #ff6600",
  };

  const brandStyle = {
    fontWeight: "bold",
    fontSize: "1.5rem",
    color: "#fff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const logoStyle = {
    width: "40px",
    height: "40px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#ff6600",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  };

  const navLinkStyle = {
    color: "#fff !important",
    fontWeight: "500",
    margin: "0 5px",
    padding: "8px 16px",
    borderRadius: "20px",
    transition: "all 0.3s ease",
    border: "2px solid transparent",
  };

  const activeNavLinkStyle = {
    ...navLinkStyle,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  };

  return (
    <>
      <style>
        {`
          .custom-navbar {
            background: linear-gradient(135deg, #5d4d3a 0%, #ff7700 50%, #6a5445 100%) !important;
          }
          
          .custom-navbar .navbar-brand:hover {
            transform: scale(1.05);
            transition: transform 0.3s ease;
          }
          
          .custom-nav-link {
            color: #fff !important;
            font-weight: 500;
            margin: 0 5px;
            padding: 8px 16px;
            border-radius: 20px;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            text-decoration: none !important;
          }
          
          .custom-nav-link:hover {
            background-color: rgba(255, 255, 255, 0.15) !important;
            border: 2px solid rgba(255, 255, 255, 0.2) !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          
          .custom-nav-link.active {
            background-color: rgba(255, 255, 255, 0.25) !important;
            border: 2px solid rgba(255, 255, 255, 0.4) !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-weight: 600;
          }
          
          .navbar-toggler {
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
            padding: 4px 8px;
          }
          
          .navbar-toggler:focus {
            box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
          }
          
          .navbar-toggler-icon {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
          }
          
          @media (max-width: 991px) {
            .custom-nav-link {
              margin: 5px 0;
              text-align: center;
            }
          }
        `}
      </style>

      <Navbar
        expand="lg"
        fixed="top"
        className="custom-navbar"
        style={navStyle}
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/"
            style={brandStyle}
            className="d-flex align-items-center"
          >
            <img
              src="/logo.png"
              alt="EmpressPC Logo"
              style={{ height: "70px" }}
            />
            <div>
              <div style={{ fontSize: "1.4rem", lineHeight: "1" }}>
                EMPRESSPC.IN
              </div>
              {/* <div style={{ fontSize: '0.7rem', opacity: '0.9', letterSpacing: '1px' }}>.IN</div> */}
            </div>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                as={NavLink}
                to="/dashboard"
                className={`custom-nav-link ${
                  location.pathname === "/dashboard" ||
                  location.pathname === "/"
                    ? "active"
                    : ""
                }`}
              >
                <i className="fas fa-tachometer-alt me-2"></i>
                Dashboard
              </Nav.Link>

              <Nav.Link
                as={NavLink}
                to="/parties"
                className={`custom-nav-link ${
                  location.pathname.includes("/parties") ? "active" : ""
                }`}
              >
                <i className="fas fa-users me-2"></i>
                Clients
                <Badge
                  bg="light"
                  text="dark"
                  className="ms-2"
                  style={{ fontSize: "0.7rem" }}
                >
                  CRM
                </Badge>
              </Nav.Link>

              <Nav.Link
                as={NavLink}
                to="/quotations"
                className={`custom-nav-link ${
                  location.pathname.includes("/quotations") ? "active" : ""
                }`}
              >
                <i className="fas fa-file-invoice-dollar me-2"></i>
                Quotations
              </Nav.Link>

              <Nav.Link
                as={NavLink}
                to="/components"
                className={`custom-nav-link ${
                  location.pathname.includes("/components") ? "active" : ""
                }`}
              >
                <i className="fas fa-microchip me-2"></i>
                Components
              </Nav.Link>
            </Nav>

            <Nav className="ms-auto">
              <Nav.Link
                href="#"
                className="custom-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  // Add settings/profile functionality here
                }}
              >
                <i className="fas fa-cog me-2"></i>
                Settings
              </Nav.Link>

              <Nav.Link
                href="#"
                className="custom-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  // Add help/support functionality here
                }}
              >
                <i className="fas fa-question-circle me-2"></i>
                Help
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Add padding to body content so it doesn't hide behind fixed navbar */}
      <div style={{ paddingTop: "80px" }}></div>
    </>
  );
};

export default Navigation;
