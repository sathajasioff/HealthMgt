import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const UserQRCode = ({ value, label, size = 160 }) => {
  const wrapRef = useRef(null);

  const downloadPng = () => {
    try {
      const canvas = wrapRef.current?.querySelector('canvas');
      if (!canvas) return;
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = (label ? label.replace(/\s+/g, '_') : 'qr_code') + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_) {}
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {label && <div className="text-sm text-gray-600">{label}</div>}
      <div ref={wrapRef} className="p-2 bg-white border rounded">
        <QRCodeCanvas value={String(value || '')} size={size} includeMargin={true} />
      </div>
      <button onClick={downloadPng} className="px-3 py-1.5 rounded border bg-white text-sm">Download QR</button>
    </div>
  );
};

export default UserQRCode;
