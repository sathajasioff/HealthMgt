import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Plus } from 'lucide-react';
import { assets } from '../assets/assets';
import API from '../services/api'; // ✅ Axios instance

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Main Login Function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please fill in both fields.');
      return;
    }

    try {
      setLoading(true);

      // send credentials to backend
      const response = await API.post('/users/login', { email, password });

      if (response.status === 200) {
        const user = response.data;

        // store user info in localStorage
        localStorage.setItem('user', JSON.stringify(user));

        alert(`Welcome back, ${user.name}! (${user.role})`);

        // redirect based on role
        const role = user.role?.toUpperCase();
        if (role === 'DOCTOR') navigate('/dashboard');
        else if (role === 'STAFF') navigate('/staff-dashboard');
        else if (role === 'PHARMACY') navigate('/pharmacy-dashboard');
        else if (role === 'HOSPITAL_STAFF') navigate('/hospital-dashboard');
        else if (role === 'PARAMEDIC') navigate('/paramedics-dashboard');
        else navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
      if (err.response && err.response.data) {
        alert(err.response.data.message || 'Invalid email or password.');
      } else {
        alert('Unable to connect to server. Check backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Optional: Google OAuth (future)
  const handleGoogleSignIn = () => {
    console.log('Google Sign In clicked');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-emerald-400 to-teal-500 relative overflow-hidden">
        {/* Logo */}
        <div className="absolute top-8 left-8 z-10">
          <img
            src={assets.LogoWHITE}
            alt="logo"
            className="h-16 cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        {/* Decorative plus icons */}
        <Plus className="absolute top-20 w-60 h-60 text-white opacity-10" strokeWidth={3} />
        <Plus className="absolute bottom-20 right-10 w-48 h-48 text-white opacity-10" strokeWidth={3} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full"></div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center w-full px-12 z-10">
          <h1 className="text-5xl font-bold text-white mb-6">Welcome Back!</h1>
          <p className="text-white text-lg text-center mb-8 opacity-90">
            Access your health records and manage<br />your appointments with ease
          </p>
          <button
            onClick={() => navigate('/register')}
            className="border-2 border-white text-white px-12 py-3 rounded-full font-medium hover:bg-white hover:text-primary transition-all duration-300"
          >
            SIGN UP
          </button>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <img
              src={assets.Logo}
              alt="logo"
              className="h-16 mx-auto cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-10">
            <h2 className="text-4xl font-bold text-primary text-center mb-2">Sign In</h2>
            <p className="text-gray-500 text-center mb-8">Access your healthcare dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 pl-10 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 pl-10 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-primary text-white font-bold py-3 px-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl uppercase tracking-wide ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-600'
                }`}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center lg:hidden">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-primary hover:underline font-semibold"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
