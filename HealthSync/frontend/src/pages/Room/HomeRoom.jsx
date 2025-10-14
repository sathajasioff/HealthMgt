import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { 
  Video, 
  Users, 
  Stethoscope, 
  Shield, 
  Clock, 
  Copy, 
  Check
} from "lucide-react";

function HomeRoom() {
  const [roomId, setRoomId] = useState("");
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState(true);
  const navigate = useNavigate();
  
  const handleRoomIdGenerate = () => {
    const randomId = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now().toString().slice(-4);
    setRoomId(randomId + timestamp);
    setCopied(false);
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOneAndOneCall = () => {
    if (!roomId) {
      alert("Please generate a consultation room ID first");
      return;
    }
    navigate(`/room/${roomId}?type=one-on-one`);
  };
  
  const handleGroupCall = () => {
    if (!roomId) {
      alert("Please generate a consultation room ID first");
      return;
    }
    navigate(`/room/${roomId}?type=group-call`);
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <Sidebar token={token} setToken={setToken} />

      {/* Main Content */}
      <div className="flex-1 ml-64 min-h-screen p-8 overflow-y-auto bg-gray-100">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full mb-6 shadow-xl ring-4 ring-primary/10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Stethoscope size={32} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Virtual Healthcare Consultation</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with doctors and patients through secure video consultations
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-2xl text-center shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-green-600/20 rounded-2xl blur-xl"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-primary to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield size={32} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">End-to-end encrypted consultations</p>
            </div>
            <div className="bg-white p-8 rounded-2xl text-center shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-green-600/20 rounded-2xl blur-xl"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-primary to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Video size={32} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">HD Video Quality</h3>
              <p className="text-sm text-gray-600">Crystal clear video and audio</p>
            </div>
            <div className="bg-white p-8 rounded-2xl text-center shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-green-600/20 rounded-2xl blur-xl"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-primary to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock size={32} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">24/7 Available</h3>
              <p className="text-sm text-gray-600">Access healthcare anytime</p>
            </div>
          </div>

          {/* Room ID Section */}
          <div className="bg-white p-10 rounded-2xl shadow-2xl mb-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Start a Consultation</h2>
            <p className="text-center text-gray-600 mb-8">
              Generate a unique room ID to begin your virtual consultation session
            </p>
            
            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex-1 min-w-[250px] relative flex items-center">
                <input
                  type="text"
                  className="w-full px-5 py-4 pr-14 border-2 border-gray-200 rounded-xl text-center font-medium text-gray-800 bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-all tracking-wide"
                  placeholder="Click Generate to create Room ID"
                  value={roomId}
                  readOnly
                />
                {roomId && (
                  <button 
                    className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-green-600 hover:scale-105 transition-all flex items-center justify-center" 
                    onClick={handleCopyRoomId}
                    title="Copy Room ID"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                )}
              </div>
              <button 
                className="px-8 py-4 bg-gradient-to-r from-primary to-green-600 text-white rounded-xl font-semibold flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-xl transition-all shadow-lg whitespace-nowrap group"
                onClick={handleRoomIdGenerate}
              >
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Video size={18} className="text-white" strokeWidth={2.5} />
                </div>
                Generate Room ID
              </button>
            </div>

            {roomId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center animate-slideIn">
                <p className="text-green-800 text-sm font-medium m-0">
                  ✓ Room ID generated successfully. Share this ID with participants.
                </p>
              </div>
            )}
          </div>

          {/* Call Type Selection */}
          <div className="bg-white p-10 rounded-2xl shadow-2xl mb-8">
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">Select Consultation Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                className="group flex items-center gap-6 p-7 border-2 border-gray-200 rounded-2xl bg-white hover:border-primary hover:-translate-y-1 hover:shadow-xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:border-gray-200"
                onClick={handleOneAndOneCall}
                disabled={!roomId}
              >
                <div className="relative flex-shrink-0 w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-green-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
                  <div className="relative w-full h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-green-600 text-white shadow-lg group-hover:shadow-xl transition-all">
                    <Video size={28} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors">Doctor-Patient Consultation</h4>
                  <p className="text-sm text-gray-600 m-0 leading-relaxed">One-on-one private consultation session</p>
                </div>
              </button>
              <button
                className="group flex items-center gap-6 p-7 border-2 border-gray-200 rounded-2xl bg-white hover:border-primary hover:-translate-y-1 hover:shadow-xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:border-gray-200"
                onClick={handleGroupCall}
                disabled={!roomId}
              >
                <div className="relative flex-shrink-0 w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
                  <div className="relative w-full h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg group-hover:shadow-xl transition-all">
                    <Users size={28} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors">Group Consultation</h4>
                  <p className="text-sm text-gray-600 m-0 leading-relaxed">Multi-participant healthcare session (up to 10)</p>
                </div>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white/95 p-8 rounded-2xl shadow-lg">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">How it works:</h4>
            <ol className="m-0 pl-6 text-gray-700 space-y-3">
              <li className="leading-relaxed text-sm">Click "Generate Room ID" to create a unique consultation room</li>
              <li className="leading-relaxed text-sm">Choose your consultation type (Doctor-Patient or Group)</li>
              <li className="leading-relaxed text-sm">Share the Room ID with other participants</li>
              <li className="leading-relaxed text-sm">Start your secure video consultation</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeRoom;