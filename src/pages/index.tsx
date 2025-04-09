import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";
import { Loader2 } from "lucide-react";

interface Product {
  popular: boolean;
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  brand: string,
}


export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
      </div>
    );
  }  
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="mt-4">
        <Button onClick={() => router.push("/add-product")}>+ Add Product</Button>
      </div>
      <table className="w-full mt-6 border border-gray-300">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>
                <Button onClick={() => router.push(`/edit-product/${product._id}`)}>Edit</Button>
                <Button
  onClick={() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user?.token;

    axios
      .delete(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${product._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => setProducts(products.filter((p) => p._id !== product._id)))
      .catch((err) => {
        console.error("Error deleting product:", err);
        alert("Failed to delete product. Make sure you're logged in as admin.");
      });
  }}
>
  Delete
</Button>
<Button
  onClick={() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const token = userData?.token;

    if (!token) {
      alert("You are not authorized.");
      return;
    }

    axios
      .put(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${product._id}`, 
        { popular: !product.popular },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setProducts(products.map((p) =>
          p._id === product._id ? { ...p, popular: res.data.popular } : p
        ));
      })
      .catch((err) => console.error("Error updating popular:", err));
  }}
          >
            Toggle Popular
          </Button>



              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button onClick={() => router.push("/addAnnouncement")}>Manage Announcements</Button>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}

AdminDashboard.auth = true;
