import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { login as loginService } from "../../services/auth.service";
import { useAuth } from "../../contexts/AuthContext";
import type { LoginRequest } from "../../types/auth.types";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    try {
      setLoading(true);

      const response = await loginService(data);

      login(
        response.data.user,
        response.data.accessToken
      );

      toast.success(response.message);

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-center text-blue-600">
          ZeroTrace
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Secure Document Sharing
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5"
        >

          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              {...register("email", {
                required: "Email is required",
              })}
              className="w-full border rounded-lg p-3"
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              {...register("password", {
                required: "Password is required",
              })}
              className="w-full border rounded-lg p-3"
            />

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;