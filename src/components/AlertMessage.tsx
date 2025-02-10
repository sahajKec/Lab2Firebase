import React from 'react';


interface AlertMessageProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ message, type, onClose }) => {
  const alertClass = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700'
  }[type];

  return (
    <div className={`${alertClass} border-l-4 p-4 my-4 rounded relative`} role="alert">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-0 right-2 text-gray-600 hover:text-gray-800"
        >
          ×
        </button>
      )}
      <p>{message}</p>
    </div>
  );
};

export default AlertMessage;
