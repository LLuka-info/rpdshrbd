import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Button } from "../../components/ui/button";

interface Announcement {
  _id: string;
  message: string;
}

export default function AddAnnouncementPage() {
  const [orders, setOrders] = useState([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id; // Assuming the user object contains an `id` field

    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    // Fetch orders
    axios
      .get(`http://localhost:5000/api/orders?userId=${userId}`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Orders error:", err));

    // Fetch announcements
    axios
      .get(`http://localhost:5000/api/announcements`)
      .then((res) => {
        console.log("Announcements fetched:", res.data); // Debug log
        setAnnouncements(res.data);
      })
      .catch((err) => {
        console.error("Announcement error:", err);
        alert("Failed to fetch announcements. Check the backend logs.");
      });
  }, []);

  const addAnnouncement = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token;
  
    if (!token) {
      alert("No token found. Please log in.");
      return;
    }
  
    try {
      const res = await axios.post(
        `http://localhost:5000/api/announcements`,
        { message: newAnnouncement },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setAnnouncements([res.data, ...announcements]);
      setNewAnnouncement("");
    } catch (error: any) {
      console.error("Add announcement error:", error);
      alert(error?.response?.data?.message || "Failed to add announcement.");
    }
  };
  
  
  const deleteAnnouncement = (id: string) => {
    const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;

    axios
      .delete(`http://localhost:5000/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setAnnouncements(announcements.filter((a) => a._id !== id));
      })
      .catch((err) => {
        console.error("Delete error:", err);
        alert("Failed to delete.");
      });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🛠 Manage Announcements</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border px-2 py-1 rounded w-full"
          type="text"
          value={newAnnouncement}
          onChange={(e) => setNewAnnouncement(e.target.value)}
          placeholder="Write a new announcement..."
        />
        <Button onClick={addAnnouncement}>Add</Button>
      </div>

      <ul className="space-y-2">
        {announcements.map((a) => (
          <li
            key={a._id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <span>{a.message}</span>
            <Button onClick={() => deleteAnnouncement(a._id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-10">📦 Orders</h2>
      <table className="w-full mt-2 border text-sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.userId}</td>
              <td>${order.total}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

AddAnnouncementPage.auth = true;