import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import userAtom from "../atoms/userAtom";
import { useParams } from "react-router-dom";
import axios from "axios";
import { PersonCircle } from "react-ionicons";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const user = useRecoilValue(userAtom);
  const { orgId } = useParams();
  const [analyticsData, setAnalyticsData] = useState({
    tasksCount: 0,
    completedTasks: 0,
    pendingTasks: 0,
    doingTasks: 0,
    userActivities: [],
    cardStats: [],
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const tasksResponse = await axios.get(`/api/boards/analytics/${orgId}`);
        const tasksData = tasksResponse.data;

        const userActivitiesResponse = await axios.get(
          `/api/users/analytics/${orgId}`
        );
        const userActivitiesData = userActivitiesResponse.data;

        const cardResponse = await axios.get(
          `/api/organizations/cards/analytics/${orgId}`
        );
        const cardData = cardResponse.data;
        console.log(cardData.cardStats);
        setAnalyticsData({
          tasksCount: tasksData.taskStats.total_tasks || 0,
          completedTasks: tasksData.taskStats.completed_tasks || 0,
          pendingTasks: tasksData.taskStats.pending_tasks || 0,
          doingTasks: tasksData.taskStats.in_progress_tasks || 0,
          userActivities: userActivitiesData.userStats || [],
          cardStats: cardData.cardStats || [],
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchAnalyticsData();
  }, [orgId]);

  const taskProgressData = {
    labels: ["Completed Tasks", "Pending Tasks", "In Progress Tasks"],
    datasets: [
      {
        data: [
          analyticsData.completedTasks,
          analyticsData.pendingTasks,
          analyticsData.doingTasks,
        ],
        backgroundColor: ["#4CAF50", "#FF9800", "cyan"],
      },
    ],
  };

  const cardTaskDistributionData = {
    labels: [...new Set(analyticsData.cardStats.map((card) => card.card_name))], // Unique card names
    datasets: [
      {
        label: "Tasks per Card",
        // Create an array of task counts matching the unique card names in 'labels'
        data: [
          ...new Set(analyticsData.cardStats.map((card) => card.card_name)),
        ].map(
          (uniqueCardName) =>
            analyticsData.cardStats
              .filter((card) => card.card_name === uniqueCardName) // Filter tasks by card name
              .reduce((total, card) => total + card.total_tasks, 0) // Sum the tasks for each card
        ),
        backgroundColor: "#2196F3",
      },
    ],
  };

  return (
    <div className="analytics-page">
      <section className="overall-stats py-10 bg-white text-gray-800">
        <div className="container px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Analytics Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="stat-card bg-orange-100 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold">Total Tasks</h3>
              <p className="text-4xl font-bold">{analyticsData.tasksCount}</p>
            </div>
            <div className="stat-card bg-green-100 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold">Completed Tasks</h3>
              <p className="text-4xl font-bold">
                {analyticsData.completedTasks}
              </p>
            </div>
            <div className="stat-card bg-purple-100 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold">Active Users</h3>
              <p className="text-4xl font-bold">
                {analyticsData.userActivities.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {analyticsData.tasksCount > 0 && (
        <section className="task-progress py-10 bg-gray-100 text-gray-800 ml-4">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Task Progress
            </h2>
            <div className="w-full md:w-1/2 mx-auto">
              <Pie data={taskProgressData} />
            </div>
          </div>
        </section>
      )}

      <section className="activity-logs py-10 bg-white text-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Recent Activity
          </h2>
          <ul className="activity-list">
            {analyticsData.userActivities.map((activity, index) => (
              <li key={index} className="activity-item py-2 border-b">
                <div className="flex items-center gap-3 cursor-pointer">
                  {activity?.profile_pic ? (
                    <img
                      src={axios.defaults.baseURL + activity.profile_pic}
                      alt="prifile_pic"
                      className="h-14 w-14 object-cover rounded-full"
                    />
                  ) : (
                    <PersonCircle
                      color="#fb923c"
                      width={"28px"}
                      height={"28px"}
                    />
                  )}
                  <div>
                    <p className="font-semibold">{activity.user_name}</p>
                    <p className="text-sm text-gray-600">
                      {activity.email}
                    </p>{" "}
                    {/* Assuming email is available */}
                    <p className="text-sm">
                      Completed {activity.completed_tasks} tasks
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="organization-stats py-10 bg-gray-100 text-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Card Insights</h2>
          <div className="w-full md:w-3/4 mx-auto">
            <Bar data={cardTaskDistributionData} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Analytics;
