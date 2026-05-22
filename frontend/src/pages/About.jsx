import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="bg-base-100 min-h-screen font-sans">
      <div className="hero min-h-[40vh] md:min-h-[50vh] bg-base-200">
        <div className="hero-content text-center px-4">
          <div className="max-w-2xl">
            <div className="badge badge-primary font-bold mb-4">EST. 2026</div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6">Quality Meets Riyadh</h1>
            <p className="text-base md:text-lg opacity-70 leading-relaxed">
              We started with a simple mission: to bring the world's best products directly to your doorstep in Riyadh,
              combining high-performance tech with everyday essentials.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="stats shadow w-full mb-16 md:mb-20 bg-base-100 border border-base-300 stats-vertical md:stats-horizontal">
          <div className="stat place-items-center">
            <div className="stat-title">Products</div>
            <div className="stat-value text-primary">5,000+</div>
            <div className="stat-desc">Curated across 5 categories</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-title">Happy Customers</div>
            <div className="stat-value">10K</div>
            <div className="stat-desc">↗︎ 400 (22%) this month</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-title">Fast Delivery</div>
            <div className="stat-value text-secondary">24h</div>
            <div className="stat-desc">Average time in Riyadh</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="card bg-base-200 shadow-xl border-t-4 border-primary">
            <div className="card-body p-6 md:p-8">
              <div className="text-4xl mb-2">💎</div>
              <h2 className="card-title font-black">Quality First</h2>
              <p className="opacity-70 text-sm md:text-base">We hand-verify every item in our store to ensure it meets international standards.</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl border-t-4 border-secondary">
            <div className="card-body p-6 md:p-8">
              <div className="text-4xl mb-2">🚚</div>
              <h2 className="card-title font-black">Local Speed</h2>
              <p className="opacity-70 text-sm md:text-base">Based in the heart of Riyadh, we prioritize logistics to get your orders to you faster.</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl border-t-4 border-accent sm:col-span-2 lg:col-span-1">
            <div className="card-body p-6 md:p-8">
              <div className="text-4xl mb-2">🤝</div>
              <h2 className="card-title font-black">24/7 Support</h2>
              <p className="opacity-70 text-sm md:text-base">Our dedicated team is always ready to help you with any inquiries or issues.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-20 p-6 md:p-10 rounded-3xl bg-neutral text-neutral-content flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-black">Want to learn more?</h2>
            <p className="opacity-70">Reach out to us or visit our office in Digital City.</p>
          </div>
          <Link to="/contact" className="btn btn-primary btn-lg rounded-full px-8 w-full md:w-auto">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};

export default About;