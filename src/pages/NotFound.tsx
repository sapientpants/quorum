import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-8">The page you're looking for doesn't exist.</p>
      <Button onClick={() => navigate("/")}>Return Home</Button>
    </div>
  );
}
