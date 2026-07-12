export default function Contact() {
  return (
    <div className="container contact-page">
      <h1>Contact UpTech</h1>
      <p>Have questions about our premium product line or need assistance with your setup? We are here to help. Reach out to our design and support team.</p>

      <div className="contact-info-grid">
        <div className="contact-item">
          <h3>Customer Support</h3>
          <p>Email: support@uptech.com</p>
          <p>Phone: +1 (800) 555-TECH</p>
          <p>Available Mon-Fri, 9am - 5pm EST</p>
        </div>
        
        <div className="contact-item">
          <h3>Headquarters</h3>
          <p>UpTech Inc.</p>
          <p>1 Infinite Loop, Cupertino, CA 95014</p>
          <p>United States</p>
        </div>
      </div>

      <div style={{ marginTop: '64px', textAlign: 'left', backgroundColor: 'var(--bg-secondary)', padding: '40px', borderRadius: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Send Us a Message</h2>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" placeholder="John Doe" style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: '#fff' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" placeholder="john@example.com" style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: '#fff' }} required />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Subject</label>
            <input type="text" placeholder="Product Inquiry" style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: '#fff' }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Message</label>
            <textarea placeholder="Write your message here..." rows="5" style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: '#fff', resize: 'vertical', fontFamily: 'inherit' }} required></textarea>
          </div>

          <button type="submit" className="btn btn-dark" style={{ alignSelf: 'flex-start', borderRadius: '8px', padding: '12px 32px' }}>
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
