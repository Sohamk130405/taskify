import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreateOrganizationModal from "../components/CreateOrganizationModal";
import userAtom from "../atoms/userAtom";
import { useRecoilValue } from "recoil";

const Home = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const user = useRecoilValue(userAtom);

  const handleCreateOrganization = (organization) => {
    console.log("Organization created:", organization);
    navigate(`/Boards/${organization.id}`);
  };

  return (
    <div className="home">
      <section className="hero bg-gray-100 text-gray-800 py-20 mt-4 rounded-xl">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Organize Your Tasks Efficiently
            </h1>
            <p className="text-lg mb-8">
              Streamline your workflow and boost productivity with our task
              management tool. Whether you're managing a team or working solo,
              we've got you covered.
            </p>
            {user ? (
              <button
                onClick={() => setModalOpen(true)}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
              >
                Create Organization
              </button>
            ) : (
              <Link
                to="/auth"
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
              >
                Get Started
              </Link>
            )}
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <img
              src="/images/marketing.png"
              alt="Marketing"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </section>

      <section className="features py-20 bg-white text-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {[
              {
                image: "/images/teamwork.png",
                title: "Collaborate",
                description:
                  "Work together with your team seamlessly. Assign tasks, track progress, and achieve your goals.",
              },
              {
                image: "/images/productivity.png",
                title: "Increase Productivity",
                description:
                  "Stay on top of your tasks and deadlines. Our tool helps you prioritize and manage your time effectively.",
              },
              {
                image: "/images/organization.png",
                title: "Organize Efficiently",
                description:
                  "Keep everything in one place. Organize tasks, projects, and teams with ease.",
              },
            ].map(({ image, title, description }) => (
              <div key={title} className="feature-card md:w-1/3 text-center">
                <img
                  src={image}
                  alt={title}
                  className="rounded-lg shadow-lg w-full md:h-[300px] object-cover mb-4"
                />
                <h3 className="text-2xl font-semibold mb-2">{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="call-to-action bg-gray-100 text-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
          {user ? (
            <button
              onClick={() => setModalOpen(true)}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
            >
              Create Organization
            </button>
          ) : (
            <Link
              to="/get-started"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
            >
              Get Started
            </Link>
          )}
        </div>
      </section>

      <CreateOrganizationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateOrganization}
      />
    </div>
  );
};

export default Home;
