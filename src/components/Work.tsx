import "./styles/Work.css";

const projects = [
  {
    title: "Heart Disease Intelligence",
    category: "Medical AI Diagnostic Platform",
    desc: "Clinical ML model predicting cardiovascular risk with a 21-feature dataset and detailed SHAP explainability visualizations.",
    tools: "Python, Machine Learning, Scikit-Learn, Flask, Pandas, NumPy",
    link: "https://github.com/Rishika-Batra/heart-disease-analysis-21",
  },
  {
    title: "Chat App",
    category: "Real-Time Conversational Platform",
    desc: "Real-time communication app using custom WebSocket channels, user status tracking, and end-to-end conversation logs storage.",
    tools: "React, Node.js, WebSockets, Express, Socket.io, MongoDB",
    link: "https://chat-app-client-ten-rho.vercel.app/login",
  },
  {
    title: "E-Commerce Analytics Engine",
    category: "ML-Powered Customer Intelligence",
    desc: "An analytics platform offering detailed cohort analysis, funnels visualization, revenue trend indicators, and sales forecasting.",
    tools: "Python, FastAPI, XGBoost, BigQuery, Data Visualization",
    link: "https://ecommerce-analytics-seven.vercel.app",
  },
  {
    title: "Job Tracker",
    category: "Application Pipeline CRM",
    desc: "A simplified kanban dashboard for tracking professional opportunities, interview schedules, and application feedback cycles.",
    tools: "React, Supabase, PostgreSQL, Google Auth, TypeScript",
    link: "https://jobtracker-version1-git-main-rishikas-projects-5ce4dea6.vercel.app/login",
  },
  {
    title: "FinSight-AI",
    category: "AI-Powered Financial Insights",
    desc: "Financial intelligence and portfolio analysis dashboard featuring multi-factor asset tracking and market sentiment indicators.",
    tools: "Python, NLP, Machine Learning, Sentiment Analysis",
    link: "https://github.com/Rishika-Batra/FinSight-AI",
  },
  {
    title: "NanoSage",
    category: "Custom Language Model (LLM)",
    desc: "A GPT-style language model built from scratch in PyTorch, featuring a custom BPE tokenizer and deployed as a full-stack React chat app.",
    tools: "PyTorch, React, Python, Transformers, Machine Learning",
    link: "https://github.com/Rishika-Batra/NanoSage",
  },
];

const Work = () => {
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <a
              key={index}
              className="project-card"
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
            >
              <div>
                <div className="project-idx">0{index + 1}</div>
                <div className="project-name">{project.title}</div>
                <div className="project-category">{project.category}</div>
                <p className="project-desc">{project.desc}</p>
              </div>
              <div className="project-tags">
                {project.tools.split(", ").slice(0, 3).map((tag, tagIndex) => (
                  <span className="project-tag" key={tagIndex}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="project-arrow">↗</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
