import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-x py-28 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-2 text-4xl">Page not found</h1>
      <p className="mt-3 text-brown-500">The page you are looking for doesn’t exist or has moved.</p>
      <Link to="/" className="btn-primary mt-8">Back to Home</Link>
    </div>
  );
}
