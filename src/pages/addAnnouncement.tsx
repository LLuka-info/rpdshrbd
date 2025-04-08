import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";

// Types
interface Announcement {
  _id: string;
  message: string;
}

interface Order {
  _id: string;
  userId: string;
  total: number;
  status: string;
}

const optiuniStatusComanda = ["Asteptam Confirmarea Platii", "Plata Procesata", "Pe drum spre warehouse", "Produsele au ajuns in warehouse. Verifica e-mailul pentru pozele QC!", "A ajuns in Europa - Germania!", "A ajuns in Romania - Oradea", "Ai primit codul de tracking CARGUS pe e-mail!", "Comanda se afla la curier!", "Comanda a fost livrata!", "Colet refuzat!"];

export default function AddAnnouncementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;

    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/orders?userId=`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Orders error:", err));

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`)
      .then((res) => setAnnouncements(res.data))
      .catch((err) => {
        console.error("Announcement error:", err);
        alert("Failed to fetch announcements. Check the backend logs.");
      });
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Could not update order status.");
    }
  };

  const addAnnouncement = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token;

    if (!token) {
      alert("No token found. Please log in.");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/announcements`,
        { message: newAnnouncement },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnnouncements([res.data, ...announcements]);
      setNewAnnouncement("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Add announcement error:", error);
        alert(error.response?.data?.message || "Failed to add announcement.");
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const deleteAnnouncement = (id: string) => {
    const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;

    axios
      .delete(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
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
            <Button onClick={() => deleteAnnouncement(a._id)}>Delete</Button>
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
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.userId}</td>
              <td>${order.total}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {optiuniStatusComanda.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

AddAnnouncementPage.auth = true;
