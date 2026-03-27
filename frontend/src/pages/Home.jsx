import heroGraphic from "../assets/dashboardGraphic.svg";
import { Link } from "react-router";

function Home() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center">
      <section className="w-full max-w-6xl mx-auto px-6 py-16 flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Left — text */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
              HRM Platform
            </span>
            <h1 className="text-4xl font-bold text-gray-800 leading-tight">
              Employee HRM
            </h1>
            <p className="text-base text-gray-400">
              Managing your workforce simplified.
            </p>
          </div>

          <Link
            to="/login"
            className="self-start px-5 py-2.5 text-sm rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            Login
          </Link>
        </div>

        {/* Right — graphic */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={heroGraphic}
            alt="HRM App"
            className="w-full max-w-md"
          />
        </div>
      </section>
    </div>
  );
}

export default Home;
