// src/components/Footer.tsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="modern-footer">
      {/* Top section with links and information */}
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-section">
            <h3>Hospital Information</h3>
            <div className="footer-info">
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Medical Center Drive, Healthcare City, HC 12345</span>
              </div>
              <div className="info-item">
                <i className="fas fa-phone"></i>
                <span>(123) 456-7890</span>
              </div>
              <div className="info-item">
                <i className="fas fa-globe"></i>
                <span>www.accidentalhealthcare.com</span>
              </div>
              <div className="info-item">
                <i className="fas fa-envelope"></i>
                <span>info@accidentalhealthcare.com</span>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <div className="footer-links">
              <a href="/">Home</a>
              <a href="/registration">Registration</a>
              <a href="/doctors">Doctors</a>
              <a href="/beds">Beds</a>
              <a href="/appointments">Appointments</a>
              <a href="/emergency">Emergency</a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Opening Hours</h3>
            <div className="opening-hours">
              <div className="hours-item">
                <span>Emergency:</span>
                <span>24/7</span>
              </div>
              <div className="hours-item">
                <span>OPD:</span>
                <span>8:00 AM - 8:00 PM</span>
              </div>
              <div className="hours-item">
                <span>Weekends:</span>
                <span>9:00 AM - 5:00 PM</span>
              </div>
              <div className="hours-item">
                <span>Pharmacy:</span>
                <span>7:00 AM - 11:00 PM</span>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h3>Emergency Contacts</h3>
            <div className="emergency-contacts">
              <div className="emergency-item">
                <i className="fas fa-ambulance"></i>
                <span>Ambulance: 108</span>
              </div>
              <div className="emergency-item">
                <i className="fas fa-first-aid"></i>
                <span>Emergency: 104</span>
              </div>
              <div className="emergency-item">
                <i className="fas fa-heartbeat"></i>
                <span>Cardiac Unit: (123) 456-HEART</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section with logo, copyright and social media */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="footer-bottom-left">
            <div className="logo-copyright">
<<<<<<< HEAD
              <img src="/images/LOGO.png" alt="Hospital Logo" className="logo" />
=======
            <img src="/images/LOGO.png" alt="Hospital Logo" className="logo" />

>>>>>>> 805e716a (database changes)
              <p className="copyright">© {new Date().getFullYear()} Accidental Healthcare. All rights reserved.</p>
            </div>
          </div>

          <div className="footer-bottom-center">
            <div className="footer-badges">
              <div className="badge">
                <i className="fas fa-award"></i>
                <span>NABH Accredited</span>
              </div>
              <div className="badge">
                <i className="fas fa-shield-alt"></i>
                <span>COVID Safe</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-right">
            <div className="social-media">
              <h4>Follow Us</h4>
              <div className="social-icons">
                <a href="https://www.instagram.com/" className="social-link" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://x.com/" className="social-link" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://www.facebook.com/" className="social-link" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://www.youtube.com/" className="social-link" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="https://mohfw.gov.in/" className="social-link" aria-label="Ministry of Health">
                  <i className="fas fa-landmark"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <div className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="fas fa-arrow-up"></i>
      </div>
    </footer>
  );
};

export default Footer;