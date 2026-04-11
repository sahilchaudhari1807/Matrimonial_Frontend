import { useNavigate } from "react-router-dom";
function Dashboard({}) {
  const navigate=useNavigate();
  const handleLogout =()=>{
    localStorage.removeItem("token");
    navigate("/login");
  }
  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Navbar */}
      <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Matrimonial Dashboard</h1>
        <button onClick={handleLogout}className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6">

        {/* Welcome Section */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            Welcome, User 👋
          </h2>
          <p className="text-gray-500 mt-2">
            Here is your profile overview and activity.
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-700">Profile Views</h3>
            <p className="text-3xl font-bold text-blue-500 mt-2">120</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-700">Matches</h3>
            <p className="text-3xl font-bold text-green-500 mt-2">35</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-700">Messages</h3>
            <p className="text-3xl font-bold text-purple-500 mt-2">12</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;