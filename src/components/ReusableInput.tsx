import React, { ChangeEvent } from 'react';

interface ReusableInputProps {
  id: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const ReusableInput: React.FC<ReusableInputProps> = ({ id, type, value, onChange, placeholder }) => {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      placeholder={placeholder}
    />
  );
};

export default ReusableInput;
