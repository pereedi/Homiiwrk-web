import React from 'react'

export default function Footer() {
  const logoUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuqkJkIRysqGPIvqI5CDOg5Z3pRzRwVaflQApCS4ecKLNdH4x-4p3TPukNnLNmA0Xe18IVosU_9ldaY_-uIpgpYc1PM6-514PM0M-vuGs7_Jpa5DjbyS3RDuIiOTUBRrIAp20MO9hdzaMU33vefma4rcxIxY0mkjyWYpQ-z9Gy4qAfXHTgN2Q_L1zLZbFxxl_aGqxa9sHjT4aO0DdnJRtsGbmE7n6wq262rv63deQOOMRy4hk1sTU__Xhnb7iDDmvPLQ'

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-top-grid">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img
                src={logoUrl}
                alt="Homiiwrk"
                className="footer-brand-logo"
              />
            </div>
            <p className="footer-brand-desc">
              Verified student accommodations and peer-matched housing networks for accredited colleges and health faculties.
            </p>
            <div className="footer-verified-badge">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ color: 'var(--color-tertiary-fixed-dim)', fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <span>100% Student Verified Landlords</span>
            </div>
          </div>

          {/* Campus Links */}
          <div>
            <p className="footer-col-title">LASUCOM Campus Area</p>
            <ul className="footer-links-list">
              <li className="footer-link-item">Ikeja General Hospital Precinct</li>
              <li className="footer-link-item">Opebi &amp; Allen Axis Hostels</li>
              <li className="footer-link-item">Computer Village Transit Links</li>
              <li className="footer-link-item">GRA Secure Student Quarters</li>
              <li className="footer-link-item">LUTH &amp; Medical Annex Routes</li>
            </ul>
          </div>

          {/* Trust Links */}
          <div>
            <p className="footer-col-title">Housing Trust</p>
            <ul className="footer-links-list">
              <li className="footer-link-item">Anti-Scam Lease Protection</li>
              <li className="footer-link-item">Zero Duplicate Inspection Fees</li>
              <li className="footer-link-item">Institutional Roster Verification</li>
              <li className="footer-link-item">Student Safety Incident Desk</li>
              <li className="footer-link-item">Verified Co-Signer Guidelines</li>
            </ul>
          </div>

          {/* Support Desk */}
          <div>
            <p className="footer-col-title">Student Support</p>
            <p className="footer-brand-desc">
              Urgent accommodation support available 24/7 for LASUCOM &amp; Ikeja college students.
            </p>
            <div className="on-call-desk-box">
              <span className="desk-title">Ikeja On-Call Desk</span>
              <span className="desk-email">help@homiiwrk.ng</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <span>
            © 2026 Homiiwrk Technologies Ltd. Built for Nigerian University Scholars.
          </span>
          <div className="footer-legal-links">
            <a href="#" className="footer-legal-link">Terms of Service</a>
            <a href="#" className="footer-legal-link">Privacy Policy</a>
            <a href="#" className="footer-legal-link">Campus Safety</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
