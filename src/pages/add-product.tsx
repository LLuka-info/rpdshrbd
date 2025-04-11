import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function AddProduct() {
  const router = useRouter();
  const [images, setImages] = useState([{ url: "", label: "" }]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    purchases: 0,
    weight: "",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [],
    popular: false,
    cnfansurl: "",
    brand: "",
  });

  const handleAddImage = () => {
    setImages([...images, { url: "", label: "" }]);
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleImageChange = (index: number, field: "url" | "label", value: string) => {
    const updated = [...images];
    updated[index][field] = value;
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      ...form,
      price: parseFloat(form.price),
      weight: parseFloat(form.weight),
      images,
      sizes: ["XS","S", "M", "L", "XL", "XXL"],
      colors: [],
      popular: false,
    };

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token;

    if (!token) {
      console.error("No token found. Please log in again.");
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push("/");
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <Input placeholder="Product Name" onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input placeholder="Price" onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <Input placeholder="Description" onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <Input placeholder="CNFans URL" onChange={(e) => setForm({ ...form, cnfansurl: e.target.value })} required />
        <Input placeholder="Weight" onChange={(e) => setForm({ ...form, weight: e.target.value })} required />
        <Input placeholder="Brand (small letters)" onChange={(e) => setForm({ ...form, brand: e.target.value })} required />

        <select
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">Select Category</option>
          <option value="tricouri">Tricouri</option>
          <option value="pantaloni">Pantaloni</option>
          <option value="hanorace">Hanorace</option>
          <option value="geci">Geci</option>
          <option value="shorts">Shorts</option>
          <option value="incaltaminte">Încălțăminte</option>
        </select>

        {/* 🔥 Image blocks */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Product Images</h2>
          {images.map((image, index) => (
            <div key={index} className="flex gap-4 items-center">
              <Input
                placeholder="Image URL"
                value={image.url}
                onChange={(e) => handleImageChange(index, "url", e.target.value)}
                required
              />
              <Input
                placeholder="Model / Label"
                value={image.label}
                onChange={(e) => handleImageChange(index, "label", e.target.value)}
                required
              />
              <Button
                type="button"
                onClick={() => handleRemoveImage(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" onClick={handleAddImage}>
            + Add Image
          </Button>
        </div>

        <Button type="submit" className="mt-4">
          Add Product
        </Button>
      </form>
    </div>
  );
}

AddProduct.auth = true;
