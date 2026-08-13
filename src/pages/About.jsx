function About() {
  return (
    <section id="center">
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>About Lhazin's Work</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '1rem auto' }}>
          This is a professional React application built with Vite and React Router.
          We're building something amazing here! 🚀
        </p>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '2rem', 
          borderRadius: '12px',
          maxWidth: '500px',
          margin: '2rem auto'
        }}>
          <h3>Tech Stack</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>⚛️ React 18</li>
            <li>⚡ Vite</li>
            <li>🧭 React Router</li>
            <li>🎨 CSS Modules</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default About