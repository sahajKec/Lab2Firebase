import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-box">
        <AlertTriangle className="icon" />
        <h1 className="title">404</h1>
        <p className="message">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/">
          <button className="home-button">Go Home</button>
        </Link>
      </div>
    </div>
  );
}
