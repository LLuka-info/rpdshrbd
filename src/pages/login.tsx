import { SetStateAction, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, { email, password });
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        console.log("User set in localStorage:", localStorage.getItem("user")); // Debug log
        
        console.log("Redirecting to /..."); // Debug log
        await router.push("/"); // Use `await` to ensure the redirection completes
      } else {
        alert("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <Input type="email" placeholder="Email" value={email} onChange={(e: { target: { value: SetStateAction<string>; }; }) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e: { target: { value: SetStateAction<string>; }; }) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full mt-3">Login</Button>
        </form>
      </div>
    </div>
  );
}