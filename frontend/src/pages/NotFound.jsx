import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">404</h1>
        <p className="mt-2 text-slate-600">The page you are looking for does not exist.</p>
        <Link
          to="/dashboard"
          className="mt-5 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
