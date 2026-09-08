import React from 'react';
import logoImg from '../assets/logo.jpg';

export default function Logo({ size = 'md', className = '', showText = false, title = 'SMART FLOOD RESCUE' }) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${currentSize} rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-blue-600 via-cyan-400 to-orange-500 shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform duration-300`}>
        <img
          src={logoImg}
          alt='Flood Rescue Management System Logo'
          className='w-full h-full object-cover rounded-full bg-slate-950'
        />
      </div>
      {showText && (
        <div>
          <span className='font-extrabold text-base text-white tracking-tight block'>
            {title}
          </span>
          <span className='text-[10px] text-cyan-400 font-mono tracking-wider block uppercase'>
            Prepare • Respond • Recover
          </span>
        </div>
      )}
    </div>

  );
}
