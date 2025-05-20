"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"; //i give the user handling work to google :)
import { auth, db } from "@/app/lib/firebase";
import { ref, set } from "firebase/database";
import { useRouter } from "next/navigation";

export default function LoginRegister() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(true);//to make login and register on the same page
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("¡Login correct!");
      router.push("/dashboard");//go to the home page
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, `users/${cred.user.uid}`), { email: cred.user.email });
      alert("¡Register correct! Now Log in.");
      setShowLogin(true);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };
/*----------------------------html----------------------------------*/
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="TaskNotes"
          src="https://images.icon-icons.com/1192/PNG/512/1490820812-14_82398.png"
          className="mx-auto h-30 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          {showLogin ? "Sign in to your account" : "Register your account"} {/*if its login in or register */}
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={showLogin ? handleLogin : handleRegister} className="space-y-6">{/*makes both precess in one */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-600 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                id="password"
                name="password"
                type="password"
                required
                autoComplete={showLogin ? "current-password" : "new-password"}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-600 sm:text-sm"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-60"
            >
              {loading
                ? showLogin
                  ? "Signing in..."
                  : "Registering..."
                : showLogin
                  ? "Sign in"
                  : "Register"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          {showLogin ? (
            <>
              Don't you have an account?{" "}
              <button
                type="button"
                className="font-semibold text-teal-600 hover:text-teal-500"
                onClick={() => {
                  setShowLogin(false);
                  setError("");
                }}
              >
                Click here to register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="font-semibold text-teal-600 hover:text-teal-500"
                onClick={() => {
                  setShowLogin(true);
                  setError("");
                }}
              >
                Click here to login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
