import { useRef, useState, useEffect } from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import "./styles/Work.css";
import CosmicGlobe from "./CosmicGlobe";

const projects = [
  {
    title: "Sentinel-Moderate",
    category: "AI Content Moderation",
    desc: "A full-stack, event-driven content moderation platform that leverages AWS AI services (Rekognition, Comprehend) to automatically analyze user-generated text and image content. It provides real-time flagging of inappropriate content with high accuracy, ensuring safe community environments and reducing manual moderation overhead.",
    tools: "TypeScript, AWS, Node.js",
    link: "https://github.com/Rishika-Batra/sentinel-moderate",
  },
  {
    title: "Sovereign AI",
    category: "Secure RAG Platform",
    desc: "Sovereign AI is a locally-hosted, secure Retrieval-Augmented Generation (RAG) platform with robust document processing capabilities and workspace isolation. It is designed to ensure complete data privacy by keeping all databases, document ingestion, and AI model inference strictly within an isolated local network environment.",
    tools: "Python, RAG, Local AI",
    link: "https://github.com/Rishika-Batra/sovereign-ai",
  },
  {
    title: "SentinelAuth",
    category: "Security Risk Scoring",
    desc: "A real-time login risk-scoring system integrated seamlessly into an AWS Cognito and Spring Boot authentication flow. It utilizes a custom machine learning autoencoder to dynamically flag and prevent account takeover attempts based on user behavior anomalies, significantly enhancing platform security.",
    tools: "Python, Spring Boot, AWS, Machine Learning",
    link: "https://github.com/Rishika-Batra/sentinelauth",
  },
  {
    title: "Job Tailor",
    category: "AI Resume Optimizer",
    desc: "An AI-powered career tool that intelligently analyzes the semantic match between a candidate's resume and a specific job posting. It automatically generates tailored resume bullet point rewrites to bypass ATS systems, along with a customized draft cover letter to maximize interview conversion rates.",
    tools: "JavaScript, LLMs, Prompt Engineering",
    link: "https://github.com/Rishika-Batra/job-tailor",
  },
  {
    title: "CivicSense",
    category: "Civic Issue Reporting Platform",
    desc: "A comprehensive civic issue reporting platform designed to bridge the gap between citizens and local government. Users can pin locations, upload photographs, and track the status of urban problems, while city officers utilize an administrative dashboard to efficiently triage, assign, and resolve reported issues.",
    tools: "TypeScript, Python, CSS, JavaScript, HTML",
    link: "https://github.com/Rishika-Batra/CivicSense",
  },
  {
    title: "NanoSage",
    category: "Custom Language Model (LLM)",
    desc: "A custom GPT-style autoregressive language model engineered from scratch using PyTorch. It features a custom Byte-Pair Encoding (BPE) tokenizer for optimized vocabulary mapping, trained on specialized datasets, and is seamlessly deployed for interactive inference via a full-stack React and Node.js chat application.",
    tools: "PyTorch, React, Python, Transformers, Machine Learning",
    link: "https://github.com/Rishika-Batra/NanoSage",
  },
  {
    title: "Chat App",
    category: "Real-Time Conversational Platform",
    desc: "A highly scalable, real-time communication application powered by custom WebSocket channels. It features dynamic online/offline user status tracking, typing indicators, read receipts, and persistent end-to-end conversation log storage using MongoDB, delivering a seamless messaging experience.",
    tools: "React, Node.js, WebSockets, Express, Socket.io, MongoDB",
    link: "https://chat-app-client-ten-rho.vercel.app/login",
  },
  {
    title: "E-Commerce Analytics Engine",
    category: "ML-Powered Customer Intelligence",
    desc: "A robust analytics engine built for e-commerce intelligence, offering deep insights through detailed cohort analysis and user funnel visualization. Powered by XGBoost and BigQuery, it provides real-time revenue trend indicators and accurate predictive sales forecasting to drive data-driven business decisions.",
    tools: "Python, FastAPI, XGBoost, BigQuery, Data Visualization",
    link: "https://ecommerce-analytics-seven.vercel.app",
  },
  {
    title: "Job Tracker",
    category: "Application Pipeline CRM",
    desc: "A streamlined kanban-style dashboard engineered specifically for tracking professional career opportunities. It allows users to manage complex interview schedules, track application feedback cycles, and monitor hiring pipeline progress seamlessly using a real-time Supabase backend and Google Authentication.",
    tools: "React, Supabase, PostgreSQL, Google Auth, TypeScript",
    link: "https://jobtracker-version1-git-main-rishikas-projects-5ce4dea6.vercel.app/login",
  },
  {
    title: "FinSight-AI",
    category: "AI-Powered Financial Insights",
    desc: "A sophisticated financial intelligence and portfolio analysis dashboard that leverages advanced NLP techniques. It features multi-factor asset tracking, real-time market sentiment indicators derived from news scraping, and predictive machine learning models to help investors make informed, data-backed market decisions.",
    tools: "Python, NLP, Machine Learning, Sentiment Analysis",
    link: "https://github.com/Rishika-Batra/FinSight-AI",
  },
];

// Duplicate array 30 times for "infinite" scroll feeling (270 items)
const displayProjects = Array(30).fill(projects).flat() as typeof projects;

const WORK_STARS = Array.from({ length: 120 }, () => ({
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  size: `${1 + Math.random() * 2}px`,
  delay: `${Math.random() * 4}s`,
  duration: `${2 + Math.random() * 4}s`,
}));

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (container.current) {
      const rect = container.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.current.style.setProperty('--mouse-x', `${x}px`);
      container.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <div className="work-section" id="work" ref={container} onMouseMove={handleMouseMove}>
      {/* Pink sparkling stars background */}
      <div className="work-stars-bg">
        {WORK_STARS.map((s, i) => (
          <div
            key={i}
            className="work-star"
            style={{
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>

      {/* Glittering stars layer (masked to cursor) */}
      <div className="work-stars-glitter">
        {WORK_STARS.map((s, i) => (
          <div
            key={`glitter-${i}`}
            className="work-star"
            style={{
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: '0.4s',
            }}
          />
        ))}
      </div>

      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>

        <div className="projects-wrapper">
          {/* Globe anchored to right edge of the cards wrapper */}
          <div className="globe-accent">
            <CosmicGlobe />
          </div>

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
