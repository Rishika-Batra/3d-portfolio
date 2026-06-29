import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Event Team Member</h4>
                <h5>E-Cell, KIET</h5>
              </div>
              <h3>OCT-PRES</h3>
            </div>
            <p>
              Actively contribute to planning and executing entrepreneurial events that foster innovation and startup culture on campus. Organized IdeaTex 2.0, Endeavour 2025, SIH 2024, SIH 2025, Innotech 2025, IdeaTex 3.0, Endeavour 2026.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Web-Dev Member</h4>
                <h5>GDSC, KIET</h5>
              </div>
              <h3>2024–26</h3>
            </div>
            <p>
              Collaborate on building and enhancing web projects while strengthening my frontend development skills.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>UI/UX Member</h4>
                <h5>DSDL, KIET</h5>
              </div>
              <h3>OCT-PRES</h3>
            </div>
            <p>
              Collaborated with the club team to design UI/UX elements for presentations, posters, and event materials, ensuring clear communication and visual consistency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
