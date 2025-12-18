import React from 'react'
import NewsletterForm from './NewsletterForm'

export default function Footer(){
  return (
    <>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-newsletter">
            <h3>Sign up for our newsletter</h3>
            <p>Be the first to know about our special offers, news, and updates.</p>
            <NewsletterForm />
          </div>
          <div className="footer-meta">
            <div className="footer-columns">
              <div className="footer-col">
                <h4>Help</h4>
                <ul>
                  <li>Contact Us</li>
                  <li>FAQ</li>
                  <li>Shipping</li>
                  <li>Returns</li>
                  <li>Order Tracking</li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <ul>
                  <li>About Us</li>
                  <li>Careers</li>
                  <li>Press</li>
                  <li>Affiliates</li>
                  <li>Blog</li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <ul>
                  <li>Terms of Service</li>
                  <li>Privacy Policy</li>
                  <li>Cookie Policy</li>
                  <li>Accessibility</li>
                  <li>Security</li>
                </ul>
              </div>
            </div>
            <div className="footer-copy">© Vibecoded</div>
          </div>
        </div>
      </footer>

      <div className="site-bottombar">
        Be the first to know about our special offers, news, and updates.
      </div>
    </>
  )
}
