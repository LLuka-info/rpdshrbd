import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";

// Types
interface Announcement {
  _id: string;
  message: string;
}

interface Order {
  orderId: string;
  userId: string;
  total: number;
  status: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  items: { name: string; quantity: number; price: number }[];
}

const optiuniStatusComanda = [
  "Asteptam Confirmarea Platii",
  "Plata Procesata",
  "Pe drum spre warehouse",
  "Produsele au ajuns in warehouse. Verifica e-mailul pentru pozele QC!",
  "A ajuns in Europa - Germania!",
  "A ajuns in Romania - Oradea",
  "Ai primit codul de tracking CARGUS pe e-mail!",
  "Comanda se afla la curier!",
  "Comanda a fost livrata!",
  "Colet refuzat!",
];

export default function AddAnnouncementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
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

      // Use functional state update to correctly manage the previous state
      setAnnouncements((prevAnnouncements) => [res.data, ...prevAnnouncements]);
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

      <h2 className="text-xl font-semibold mt-10 mb-4">📦 Orders</h2>

      <div className="overflow-x-auto">
        {/* Desktop/Table View */}
        <table className="min-w-full table-auto border border-gray-200 hidden sm:table">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}> {/* Use orderId instead of _id */}
                <td className="px-4 py-2">{order.orderId}</td>
                <td className="px-4 py-2">{order.userId}</td>
                <td className="px-4 py-2">${order.total}</td>
                <td className="px-4 py-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.orderId, e.target.value)} {/* Use orderId instead of _id */}
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

        {/* Mobile View */}
        <div className="block sm:hidden">
          {orders.map((order) => (
            <div
              key={order.orderId} {/* Use orderId instead of _id */}
              className="border-b p-4 sm:flex sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="mb-2 sm:mb-0">
                <p className="font-semibold">ID:</p>
                <p className="text-sm">{order.orderId}</p> {/* Use orderId instead of _id */}
              </div>

              <div className="mb-2 sm:mb-0">
                <p className="font-semibold">User:</p>
                <p className="text-sm">{order.userId}</p>
              </div>

              <div className="mb-2 sm:mb-0">
                <p className="font-semibold">Total:</p>
                <p className="text-sm">${order.total}</p>
              </div>

              <div className="mb-2 sm:mb-0">
                <p className="font-semibold">Status:</p>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.orderId, e.target.value)} {/* Use orderId instead of _id */}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {optiuniStatusComanda.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

AddAnnouncementPage.auth = true;
