import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={24} className="text-green-500" />,
    error: <AlertCircle size={24} className="text-red-500" />,
    warning: <AlertTriangle size={24} className="text-orange-500" />,
    info: <Info size={24} className="text-blue-500" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-orange-50 border-orange-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 min-w-[350px] max-w-md animate-slideInRight`}>
      <div className={`${colors[type]} border-2 rounded-xl shadow-2xl p-4 flex items-start gap-3`}>
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1">
          <div className="text-gray-800 font-medium text-sm leading-relaxed whitespace-pre-line">
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
