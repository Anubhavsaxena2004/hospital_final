import React from "react";
import "./ImportantLinksNew.css";

export default function ImportantLinksNew() {
  return (
    <div className="important-links-container">
      <div className="header-bar">
        <h2 className="standard-heading text-heading">IMPORTANT LINKS</h2>
      </div>
      <div className="links-grid">
        <a
          href="https://hmis.mohfw.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="link-card"
        >
          <div className="icon-wrapper">
            <img src="/images/link.png" alt="HMIS" className="standard-image image-small" />
          </div>
          <p className="standard-text text-small">Health Management Information System</p>
        </a>

        <a
          href="https://cghs.mohfw.gov.in/AHIMSG5/hissso/Login"
          target="_blank"
          rel="noopener noreferrer"
          className="link-card"
        >
          <div className="icon-wrapper">
            <img src="/images/link1.png" alt="CGHS" className="standard-image image-small" />
          </div>
          <p className="standard-text text-small">Central Government Health Scheme</p>
        </a>

        <a
          href="https://mcc.nic.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="link-card"
        >
          <div className="icon-wrapper">
            <img src="/images/link2.jpeg" alt="MCC" className="standard-image image-small" />
          </div>
          <p className="standard-text text-small">Medical Counselling Medical / Dental Seats</p>
        </a>

        <a
          href="http://nhm.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="link-card"
        >
          <div className="icon-wrapper">
            <img src="/images/link3.png" alt="NHM" className="standard-image image-small" />
          </div>
          <p className="standard-text text-small">National Health Mission</p>
        </a>

        <a
          href="https://mohfw.gov.in/?q=en/vacancy"
          target="_blank"
          rel="noopener noreferrer"
          className="link-card"
        >
          <div className="icon-wrapper">
            <img src="/images/link4.png" alt="Vacancy" className="standard-image image-small" />
          </div>
          <p className="standard-text text-small">Vacancy</p>
        </a>

        <a
          href="https://mohfw.gov.in/?q=en/basicpage-65"
          target="_blank"
          rel="noopener noreferrer"
          className="link-card"
        >
          <div className="icon-wrapper">
            <img src="/images/link6.jpeg" alt="Acts" className="standard-image image-small" />
          </div>
          <p className="standard-text text-small">Acts , Rule &amp; Standard</p>
        </a>

        <a
          href="https://ors.gov.in/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="link-card"
        >
          <div className="icon-wrapper">
            <img src="/images/link7.jpeg" alt="ORS" className="standard-image image-small" />
          </div>
          <p className="standard-text text-small">Online Registration System</p>
        </a>

        <a
          href="https://www.cowin.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="link-card"
        >
          <div className="icon-wrapper">
            <img src="/images/link8.jpeg" alt="COWIN" className="standard-image image-small" />
          </div>
          <p className="standard-text text-small">CoWIN</p>
        </a>
      </div>
    </div>
  );
}
