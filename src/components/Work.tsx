import { useRef, useState, useEffect } from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import "./styles/Work.css";

const projects = [
  {
    title: "Sentinel-Moderate",
    category: "AI Content Moderation",
    desc: "A full-stack, event-driven content moderation platform that leverages AWS AI services to automatically analyze user-generated text and image content.",
    tools: "TypeScript, AWS, Node.js",
    link: "https://github.com/Rishika-Batra/sentinel-moderate",
  },
  {
    title: "SentinelAuth",
    category: "Security Risk Scoring",
    desc: "A real-time login risk-scoring system inside an AWS Cognito + Spring Boot auth flow, using a custom autoencoder to flag account takeovers.",
    tools: "Python, Spring Boot, AWS, Machine Learning",
    link: "https://github.com/Rishika-Batra/sentinelauth",
  },
  {
    title: "Job Tailor",
    category: "AI Resume Optimizer",
    desc: "An AI-powered tool that analyzes how well a resume matches a job posting, generating tailored resume bullet rewrites and a draft cover letter.",
    tools: "JavaScript, LLMs, Prompt Engineering",
    link: "https://github.com/Rishika-Batra/job-tailor",
  },
  {
    title: "CivicSense",
    category: "Civic Issue Reporting Platform",
    desc: "A civic issue reporting platform where citizens can pin, photograph, and track urban problems for city officers to triage and resolve.",
    tools: "TypeScript, Python, CSS, JavaScript, HTML",
    link: "https://github.com/Rishika-Batra/CivicSense",
  },
  {
    title: "NanoSage",
    category: "Custom Language Model (LLM)",
    desc: "A GPT-style language model built from scratch in PyTorch, featuring a custom BPE tokenizer and deployed as a full-stack React chat app.",
    tools: "PyTorch, React, Python, Transformers, Machine Learning",
    link: "https://github.com/Rishika-Batra/NanoSage",
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
];

// Duplicate array 30 times for "infinite" scroll feeling (270 items)
const displayProjects = Array(30).fill(projects).flat();

const Work = () => {
  const container = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(Math.floor(displayProjects.length / 2));

  // Get dynamic stride so it perfectly adapts to CSS width changes (like mobile sizes)
  const getScrollStride = () => {
    if (!gridRef.current) return 500;
    const card = gridRef.current.querySelector(".project-card") as HTMLElement;
    if (!card) return 500;
    return card.offsetWidth + 50; // 50px is the CSS gap
  };

  useEffect(() => {
    if (gridRef.current) {
      // Start dead center immediately on mount
      gridRef.current.scrollLeft = Math.floor(displayProjects.length / 2) * getScrollStride();
    }
  }, []);

  const handleScroll = () => {
    if (!gridRef.current) return;
    const stride = getScrollStride();
    const index = Math.round(gridRef.current.scrollLeft / stride);
    setActiveIndex(index);
  };

  const handlePrev = () => {
    if (gridRef.current) {
      gridRef.current.scrollBy({ left: -getScrollStride(), behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (gridRef.current) {
      gridRef.current.scrollBy({ left: getScrollStride(), behavior: "smooth" });
    }
  };

  return (
    <div className="work-section" id="work" ref={container}>
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="projects-wrapper">
          <div className="projects-grid" ref={gridRef} onScroll={handleScroll}>
          {displayProjects.map((project, index) => {
            const originalIndex = index % projects.length;
            return (
            <a
              key={index}
              className={`project-card ${index === activeIndex ? "active-card" : ""}`}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
            >
              <div>
                <div className="project-idx">0{originalIndex + 1}</div>
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
          )})}
          </div>
          <button className="scroll-nav-btn scroll-prev-btn" onClick={handlePrev}>
            <FaChevronLeft /> Prev
          </button>
          <button className="scroll-nav-btn scroll-next-btn" onClick={handleNext}>
            Next <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Work;
