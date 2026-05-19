const About = () => {
  return (
    <div className="bg-base-100 min-h-screen font-sans">
      {/* 1. Hero Section */}
      <div className="hero min-h-[50vh] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <div className="badge badge-primary font-bold mb-4">EST. 2026</div>
            <h1 className="text-5xl md:text-7xl font-black mb-6">Quality Meets Riyadh</h1>
            <p className="text-lg opacity-70 leading-relaxed">
              We started with a simple mission: to bring the world’s best products directly to your doorstep in Riyadh, 
              combining high-performance tech with everyday essentials.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* 2. Stats Section */}
        <div className="stats shadow w-full mb-20 bg-base-100 border border-base-300">
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

        {/* 3. Our Values */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card bg-base-200 shadow-xl border-t-4 border-primary">
            <div className="card-body">
              <div className="text-4xl mb-2">💎</div>
              <h2 className="card-title font-black">Quality First</h2>
              <p className="opacity-70">We hand-verify every item in our store to ensure it meets international standards.</p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl border-t-4 border-secondary">
            <div className="card-body">
              <div className="text-4xl mb-2">🚚</div>
              <h2 className="card-title font-black">Local Speed</h2>
              <p className="opacity-70">Based in the heart of Riyadh, we prioritize logistics to get your orders to you faster.</p>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl border-t-4 border-accent">
            <div className="card-body">
              <div className="text-4xl mb-2">🤝</div>
              <h2 className="card-title font-black">24/7 Support</h2>
              <p className="opacity-70">Our dedicated team is always ready to help you with any inquiries or issues.</p>
            </div>
          </div>
        </div>

        {/* 4. Contact CTA */}
        <div className="mt-20 p-10 rounded-3xl bg-neutral text-neutral-content flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black">Want to learn more?</h2>
            <p className="opacity-70">Reach out to us or visit our office in Digital City.</p>
          </div>
          <button className="btn btn-primary btn-lg rounded-full px-8">Contact Us</button>
        </div>
      </div>
    </div>
  );
};

export default About;