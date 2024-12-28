import React from 'react';

const UserAvatar = ({ 
  user, 
  size = 'medium', 
  className = '' 
}) => {
  // Debugging logs
  console.log('UserAvatar - User Object:', user);
  console.log('PhotoURL:', user?.photoUrl);

  // Determine size classes
  const sizeClasses = {
    small: 'w-8 h-8 text-base',
    medium: 'w-12 h-12 text-lg',
    large: 'w-32 h-32 text-4xl'
  }[size];

  // Fallback to first letter of username if no photo
  const avatarContent = user?.photoUrl ? (
    <img 
      src={user.photoUrl} 
      alt={`${user.username}'s avatar`} 
      className="w-full h-full object-cover rounded-full"
      onError={(e) => {
        console.error('Image load error:', e);
        e.target.style.display = 'none';
      }}
    />
  ) : (
    <span className="text-[#9ab]">
      {user?.username?.charAt(0).toUpperCase()}
    </span>
  );

  return (
    <div 
      className={`
        rounded-full 
        bg-[#14181c] 
        flex 
        items-center 
        justify-center 
        overflow-hidden
        flex-shrink-0
        ${sizeClasses}
        ${className}
      `}
    >
      {avatarContent}
    </div>
  );
};

export default UserAvatar;