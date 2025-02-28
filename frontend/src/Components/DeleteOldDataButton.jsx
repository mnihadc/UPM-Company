import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const DeleteOldDataButton = () => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const { value: inputValue } = await Swal.fire({
      title: "Confirm Deletion",
      text: "Type 'Delete Data' to confirm",
      input: "text",
      inputPlaceholder: "Delete Data",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (value !== "Delete Data") {
          return "Text does not match. Please type exactly: Delete Data Delete";
        }
      },
    });

    if (!inputValue) return; // User canceled

    setLoading(true);

    try {
      const response = await axios.delete("/api/sales/delete-old-sales");

      if (response.data.deletedCount > 0) {
        Swal.fire(
          "Deleted!",
          `Deleted ${response.data.deletedCount} records successfully!`,
          "success"
        );
      } else {
        Swal.fire("No Data Found", "No old sales records to delete.", "info");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to delete old data.", "error");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <p className="mb-4 text-gray-700 text-lg">
        This action will permanently delete all sales records older than 3
        months. Please confirm before proceeding.
      </p>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition duration-300"
      >
        {loading ? "Deleting..." : "Delete Old Data"}
      </button>
    </div>
  );
};

export default DeleteOldDataButton;
