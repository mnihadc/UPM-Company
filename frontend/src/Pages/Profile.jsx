import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import {
  signoutUserStart,
  signoutUserSuccess,
  signoutUserFailure,
} from "../Redux/user/userSlice";
const Profile = () => {
  const dispatch = useDispatch();
  const user = {
    username: "John Doe",
    email: "johndoe@example.com",
    role: "Professional Buyer",
    userId: "123456",
    address: {
      fullName: "John Doe",
      email: "johndoe@example.com",
      gender: "Male",
      dob: "1990-05-15",
      phone: "+1 234 567 890",
      address: "1234 Elm Street",
      city: "New York",
      district: "Manhattan",
      state: "NY",
      postalCode: "10001",
    },
    membershipLevel: {
      newBuyer: 80,
      engagedShopper: 60,
      premiumMember: 40,
      superPremiumMember: 20,
    },
  };
  const handleLogout = async () => {
    const confirmLogout = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    });

    if (confirmLogout.isConfirmed) {
      try {
        dispatch(signoutUserStart()); // Set loading state

        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        if (response.ok) {
          dispatch(signoutUserSuccess()); // Clear user state
          localStorage.removeItem("token"); // Remove token
          await Swal.fire(
            "Logged Out!",
            "You have been logged out.",
            "success"
          );
          window.location.href = "/login"; // Redirect to login
        } else {
          dispatch(signoutUserFailure("Logout failed! Please try again."));
          Swal.fire("Error", "Logout failed! Please try again.", "error");
        }
      } catch (error) {
        dispatch(signoutUserFailure(error.message));
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center pt-10">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center w-full md:w-1/3">
            <img
              src="https://bootdey.com/img/Content/avatar/avatar7.png"
              alt="User"
              className="rounded-full w-32 mb-4"
            />
            <h4 className="text-xl font-semibold">{user.username}</h4>
            <p className="text-gray-400">{user.email}</p>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg w-full md:w-2/3">
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  className="w-full p-2 mt-1 bg-gray-700 rounded border border-gray-600 focus:outline-none"
                  defaultValue={user.username}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full p-2 mt-1 bg-gray-700 rounded border border-gray-600 focus:outline-none"
                  defaultValue={user.email}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  className="w-full p-2 mt-1 bg-gray-700 rounded border border-gray-600 focus:outline-none"
                  defaultValue="********"
                />
              </div>
              <div className="flex justify-between">
                <button type="button" className="bg-blue-600 px-4 py-2 rounded">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="bg-amber-500 px-4 py-2 rounded"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button type="button" className="bg-red-600 px-4 py-2 rounded">
                  Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Membership Progress</h3>
          {Object.entries(user.membershipLevel).map(([level, value]) => (
            <div key={level} className="mb-3">
              <small className="block capitalize">
                {level.replace(/([A-Z])/g, " $1").trim()}
              </small>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
