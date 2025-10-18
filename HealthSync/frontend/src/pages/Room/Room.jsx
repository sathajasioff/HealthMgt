import React, { useRef, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { APP_ID, SECRET } from "../../Config";
import MedicalRecordForm from "../../components/MedicalRecordForm";
import { FileText } from "lucide-react";
import API from "../../services/api";

function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const zpRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [joined, setJoined] = useState(false);
  const [callType, setCallType] = useState(""); // State to store the call type
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [checkup, setCheckup] = useState(undefined);
  const [canJoin, setCanJoin] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = user?.role?.toUpperCase?.() || '';

  // Initialize ZegoUIKit and join room on component mount
  const myMeeting = (type) => {
    const appID = APP_ID;
    const serverSecret = SECRET;
    
    // Validate credentials
    if (!appID || !serverSecret || serverSecret === "YOUR_SECRET_KEY_HERE" || serverSecret === "") {
      alert("❌ INVALID CREDENTIALS!\n\n" +
            "Please configure your ZegoCloud credentials in Config.jsx:\n\n" +
            "1. Visit: https://console.zegocloud.com/\n" +
            "2. Create a project and get your ServerSecret\n" +
            "3. Replace 'YOUR_SECRET_KEY_HERE' with your actual secret\n\n" +
            "Current SECRET: " + (serverSecret || "empty"));
      navigate("/homeroom");
      return;
    }

    try {
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        Date.now().toString(),
        "User_" + Date.now().toString().slice(-6)
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp;

      zp.joinRoom({
        container: videoContainerRef.current,
        sharedLinks: [
          {
            name: "Video Call Link",
            url:
              window.location.protocol +
              "//" +
              window.location.host +
              window.location.pathname +
              "?type=" + encodeURIComponent(type),
          },
        ],
        scenario: {
          mode:
            type === "one-on-one"
              ? ZegoUIKitPrebuilt.OneONoneCall
              : ZegoUIKitPrebuilt.GroupCall,
        },
        maxUsers: type === "one-on-one" ? 2 : 10,
        onJoinRoom: () => {
          setJoined(true);
        },
        onLeaveRoom: () => {
          navigate("/");
        },
      });
    } catch (error) {
      console.error("Error initializing video call:", error);
      alert("Failed to initialize video call. Please check your credentials and try again.");
      navigate("/");
    }
  };

  // Handle exit from the room
  const handleExit = () => {
    if (zpRef.current) {
      zpRef.current.destroy();
    }
    navigate("/");
  };

  // On component mount, extract call type from location and initialize meeting
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const type = query.get("type");

    setCallType(type); // Update state with call type
  }, [location.search]);

  // Initialize meeting only after verification passes
  useEffect(() => {
    if (callType && roomId && canJoin) {
      myMeeting(callType);
    }

    // Cleanup function for component unmount
    return () => {
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch (error) {
          console.error("Error destroying Zego instance:", error);
        }
      }
    };
  }, [callType, roomId, canJoin]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/checkups/room/${roomId}`);
        setCheckup(res.data || null);
      } catch (_) {
        setCheckup(null);
      }
    };
    if (roomId) load();
  }, [roomId]);

  // Verify link ownership/eligibility once checkup is loaded
  useEffect(() => {
    const verify = async () => {
      // wait until checkup is fetched (undefined means loading)
      if (typeof checkup === 'undefined') return;
      // invalid or missing checkup
      if (!checkup) {
        setVerifyError('Invalid or expired consultation link.');
        alert('Invalid or expired consultation link.');
        navigate('/homeroom');
        return;
      }
      // role-based validation
      const uid = user?.id || user?._id || user?.userId || '';
      if (role === 'PATIENT') {
        const pid = checkup?.patientId || checkup?.patientID || '';
        if (String(uid) !== String(pid)) {
          setVerifyError('This session link is not associated with your account.');
          alert('This session link is not associated with your account.');
          navigate('/homeroom');
          return;
        }
      }
      if (role === 'DOCTOR') {
        const did = checkup?.doctorId || checkup?.doctorID || '';
        // If doctorId exists and doesn't directly match the logged-in user's id, try mapping via doctor document (userId)
        if (did && String(uid) !== String(did)) {
          try {
            const docsRes = await API.get('/doctors');
            const docs = Array.isArray(docsRes.data) ? docsRes.data : [];
            const assigned = docs.find(d => String(d.id || d._id) === String(did));
            // If assigned doctor exists and their userId matches current user, allow
            if (assigned && String(assigned.userId) === String(uid)) {
              setCanJoin(true);
              return;
            }
          } catch (e) {
            // ignore fetch errors and fall through to block
          }
          setVerifyError('This session is assigned to a different doctor.');
          alert('This session is assigned to a different doctor.');
          navigate('/homeroom');
          return;
        }
      }
      // passed verification
      setCanJoin(true);
    };
    verify();
  }, [checkup, role, user, navigate]);

  const handleSaveMedicalRecord = (recordData) => {
    console.log('Medical record saved:', recordData);
    setShowMedicalForm(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {!joined && (
        <>
          <header className="bg-gray-800 text-white p-4 text-center text-2xl">
            {callType === "one-on-one"
              ? "One-on-One Video Call"
              : "Group Video Call"}
          </header>
          <button 
            className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer z-50"
            onClick={handleExit}
          >
            Exit
          </button>
        </>
      )}
      <div ref={videoContainerRef} className="flex-1 flex justify-center items-center h-[calc(100vh-3rem)]" />
      
      {/* Medical Records Button - Floating Action Button */}
      {joined && (
        <>
          <button
            onClick={() => setShowMedicalForm(true)}
            className="fixed bottom-8 left-8 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 z-40 flex items-center gap-2"
            title="Add Medical Record"
          >
            <FileText size={24} />
            <span className="font-medium">Medical Record</span>
          </button>
          {role === 'DOCTOR' && (
            <button
              onClick={async () => {
                try {
                  if (checkup?.id || checkup?._id) {
                    await API.put(`/checkups/${checkup.id || checkup._id}/status`, { status: 'Completed' });
                    window.dispatchEvent(new Event('checkups:updated'));
                  }
                } catch (e) {
                  // ignore
                } finally {
                  if (zpRef.current) {
                    try { zpRef.current.destroy(); } catch {}
                  }
                  navigate('/');
                }
              }}
              className="fixed bottom-8 right-8 bg-red-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-700 transition-all z-40 font-medium"
            >
              Finish
            </button>
          )}
        </>
      )}

      {/* Medical Record Form Modal */}
      {showMedicalForm && (
        <MedicalRecordForm
          roomId={roomId}
          onClose={() => setShowMedicalForm(false)}
          onSave={handleSaveMedicalRecord}
        />
      )}
    </div>
  );
}

export default Room;