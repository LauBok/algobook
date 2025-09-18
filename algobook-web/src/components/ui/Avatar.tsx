import React from 'react';

export interface AvatarOption {
  id: string;
  name: string;
  category: 'people' | 'animals' | 'fantasy' | 'objects' | 'custom';
  emoji?: string;
  gradient?: string;
  icon?: React.ReactNode;
  customImageUrl?: string;
}

// Apple-style subtle gradient backgrounds
const gradients = {
  blue: 'bg-gradient-to-br from-blue-200/40 to-blue-300/50',
  purple: 'bg-gradient-to-br from-purple-200/40 to-purple-300/50',
  pink: 'bg-gradient-to-br from-pink-200/40 to-pink-300/50',
  green: 'bg-gradient-to-br from-green-200/40 to-green-300/50',
  yellow: 'bg-gradient-to-br from-yellow-200/40 to-orange-200/50',
  red: 'bg-gradient-to-br from-red-200/40 to-red-300/50',
  indigo: 'bg-gradient-to-br from-indigo-200/40 to-indigo-300/50',
  teal: 'bg-gradient-to-br from-teal-200/40 to-teal-300/50',
  orange: 'bg-gradient-to-br from-orange-200/40 to-orange-300/50',
  cyan: 'bg-gradient-to-br from-cyan-200/40 to-cyan-300/50',
  violet: 'bg-gradient-to-br from-violet-200/40 to-violet-300/50',
  emerald: 'bg-gradient-to-br from-emerald-200/40 to-emerald-300/50',
  rose: 'bg-gradient-to-br from-rose-200/40 to-rose-300/50',
  sky: 'bg-gradient-to-br from-sky-200/40 to-sky-300/50',
  amber: 'bg-gradient-to-br from-amber-200/40 to-amber-300/50',
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  // People - Modern diverse characters
  { id: 'developer', name: 'Developer', category: 'people', emoji: '👨‍💻', gradient: 'blue' },
  { id: 'developer-woman', name: 'Developer Woman', category: 'people', emoji: '👩‍💻', gradient: 'purple' },
  { id: 'student', name: 'Student', category: 'people', emoji: '👨‍🎓', gradient: 'emerald' },
  { id: 'student-woman', name: 'Student Woman', category: 'people', emoji: '👩‍🎓', gradient: 'pink' },
  { id: 'scientist', name: 'Scientist', category: 'people', emoji: '👨‍🔬', gradient: 'teal' },
  { id: 'scientist-woman', name: 'Scientist Woman', category: 'people', emoji: '👩‍🔬', gradient: 'cyan' },
  { id: 'artist', name: 'Artist', category: 'people', emoji: '👨‍🎨', gradient: 'orange' },
  { id: 'artist-woman', name: 'Artist Woman', category: 'people', emoji: '👩‍🎨', gradient: 'rose' },
  { id: 'teacher', name: 'Teacher', category: 'people', emoji: '👨‍🏫', gradient: 'indigo' },
  { id: 'teacher-woman', name: 'Teacher Woman', category: 'people', emoji: '👩‍🏫', gradient: 'violet' },
  { id: 'detective', name: 'Detective', category: 'people', emoji: '🕵️‍♂️', gradient: 'blue' },
  { id: 'detective-woman', name: 'Detective Woman', category: 'people', emoji: '🕵️‍♀️', gradient: 'pink' },
  
  // Animals - Cute and friendly (greatly expanded!)
  { id: 'cat', name: 'Cat', category: 'animals', emoji: '🐱', gradient: 'orange' },
  { id: 'dog', name: 'Dog', category: 'animals', emoji: '🐶', gradient: 'amber' },
  { id: 'fox', name: 'Fox', category: 'animals', emoji: '🦊', gradient: 'red' },
  { id: 'bear', name: 'Bear', category: 'animals', emoji: '🐻', gradient: 'blue' },
  { id: 'panda', name: 'Panda', category: 'animals', emoji: '🐼', gradient: 'emerald' },
  { id: 'koala', name: 'Koala', category: 'animals', emoji: '🐨', gradient: 'teal' },
  { id: 'rabbit', name: 'Rabbit', category: 'animals', emoji: '🐰', gradient: 'pink' },
  { id: 'hamster', name: 'Hamster', category: 'animals', emoji: '🐹', gradient: 'amber' },
  { id: 'lion', name: 'Lion', category: 'animals', emoji: '🦁', gradient: 'orange' },
  { id: 'tiger', name: 'Tiger', category: 'animals', emoji: '🐯', gradient: 'red' },
  { id: 'owl', name: 'Owl', category: 'animals', emoji: '🦉', gradient: 'indigo' },
  { id: 'penguin', name: 'Penguin', category: 'animals', emoji: '🐧', gradient: 'cyan' },
  { id: 'monkey', name: 'Monkey', category: 'animals', emoji: '🐵', gradient: 'amber' },
  { id: 'frog', name: 'Frog', category: 'animals', emoji: '🐸', gradient: 'emerald' },
  
  // More cute animals
  { id: 'mouse', name: 'Mouse', category: 'animals', emoji: '🐭', gradient: 'pink' },
  { id: 'pig', name: 'Pig', category: 'animals', emoji: '🐷', gradient: 'rose' },
  { id: 'cow', name: 'Cow', category: 'animals', emoji: '🐮', gradient: 'green' },
  { id: 'wolf', name: 'Wolf', category: 'animals', emoji: '🐺', gradient: 'blue' },
  { id: 'elephant', name: 'Elephant', category: 'animals', emoji: '🐘', gradient: 'indigo' },
  { id: 'rhino', name: 'Rhino', category: 'animals', emoji: '🦏', gradient: 'violet' },
  { id: 'hippo', name: 'Hippo', category: 'animals', emoji: '🦛', gradient: 'purple' },
  { id: 'giraffe', name: 'Giraffe', category: 'animals', emoji: '🦒', gradient: 'amber' },
  { id: 'zebra', name: 'Zebra', category: 'animals', emoji: '🦓', gradient: 'blue' },
  { id: 'horse', name: 'Horse', category: 'animals', emoji: '🐎', gradient: 'orange' },
  { id: 'deer', name: 'Deer', category: 'animals', emoji: '🦌', gradient: 'emerald' },
  { id: 'chipmunk', name: 'Chipmunk', category: 'animals', emoji: '🐿️', gradient: 'amber' },
  { id: 'hedgehog', name: 'Hedgehog', category: 'animals', emoji: '🦔', gradient: 'rose' },
  { id: 'bat', name: 'Bat', category: 'animals', emoji: '🦇', gradient: 'violet' },
  { id: 'sloth', name: 'Sloth', category: 'animals', emoji: '🦥', gradient: 'green' },
  { id: 'otter', name: 'Otter', category: 'animals', emoji: '🦦', gradient: 'cyan' },
  { id: 'skunk', name: 'Skunk', category: 'animals', emoji: '🦨', gradient: 'purple' },
  { id: 'kangaroo', name: 'Kangaroo', category: 'animals', emoji: '🦘', gradient: 'red' },
  { id: 'badger', name: 'Badger', category: 'animals', emoji: '🦡', gradient: 'blue' },
  
  // Birds and flying creatures
  { id: 'chicken', name: 'Chicken', category: 'animals', emoji: '🐔', gradient: 'amber' },
  { id: 'baby-chick', name: 'Baby Chick', category: 'animals', emoji: '🐤', gradient: 'yellow' },
  { id: 'hatching-chick', name: 'Hatching Chick', category: 'animals', emoji: '🐣', gradient: 'amber' },
  { id: 'duck', name: 'Duck', category: 'animals', emoji: '🦆', gradient: 'cyan' },
  { id: 'swan', name: 'Swan', category: 'animals', emoji: '🦢', gradient: 'pink' },
  { id: 'eagle', name: 'Eagle', category: 'animals', emoji: '🦅', gradient: 'blue' },
  { id: 'flamingo', name: 'Flamingo', category: 'animals', emoji: '🦩', gradient: 'rose' },
  { id: 'peacock', name: 'Peacock', category: 'animals', emoji: '🦚', gradient: 'emerald' },
  { id: 'parrot', name: 'Parrot', category: 'animals', emoji: '🦜', gradient: 'green' },
  { id: 'turkey', name: 'Turkey', category: 'animals', emoji: '🦃', gradient: 'orange' },
  
  // Sea creatures
  { id: 'octopus', name: 'Octopus', category: 'animals', emoji: '🐙', gradient: 'purple' },
  { id: 'squid', name: 'Squid', category: 'animals', emoji: '🦑', gradient: 'violet' },
  { id: 'shrimp', name: 'Shrimp', category: 'animals', emoji: '🦐', gradient: 'orange' },
  { id: 'crab', name: 'Crab', category: 'animals', emoji: '🦀', gradient: 'red' },
  { id: 'lobster', name: 'Lobster', category: 'animals', emoji: '🦞', gradient: 'red' },
  { id: 'fish', name: 'Fish', category: 'animals', emoji: '🐟', gradient: 'cyan' },
  { id: 'tropical-fish', name: 'Tropical Fish', category: 'animals', emoji: '🐠', gradient: 'teal' },
  { id: 'blowfish', name: 'Blowfish', category: 'animals', emoji: '🐡', gradient: 'amber' },
  { id: 'shark', name: 'Shark', category: 'animals', emoji: '🦈', gradient: 'blue' },
  { id: 'whale', name: 'Whale', category: 'animals', emoji: '🐳', gradient: 'sky' },
  { id: 'dolphin', name: 'Dolphin', category: 'animals', emoji: '🐬', gradient: 'cyan' },
  { id: 'seal', name: 'Seal', category: 'animals', emoji: '🦭', gradient: 'blue' },
  
  // Insects and small creatures
  { id: 'bee', name: 'Bee', category: 'animals', emoji: '🐝', gradient: 'amber' },
  { id: 'honeybee', name: 'Honeybee', category: 'animals', emoji: '🍯', gradient: 'yellow' },
  { id: 'butterfly', name: 'Butterfly', category: 'animals', emoji: '🦋', gradient: 'violet' },
  { id: 'ladybug', name: 'Ladybug', category: 'animals', emoji: '🐞', gradient: 'red' },
  { id: 'cricket', name: 'Cricket', category: 'animals', emoji: '🦗', gradient: 'emerald' },
  { id: 'spider', name: 'Spider', category: 'animals', emoji: '🕷️', gradient: 'purple' },
  { id: 'snail', name: 'Snail', category: 'animals', emoji: '🐌', gradient: 'green' },
  
  // Reptiles and amphibians
  { id: 'turtle', name: 'Turtle', category: 'animals', emoji: '🐢', gradient: 'emerald' },
  { id: 'lizard', name: 'Lizard', category: 'animals', emoji: '🦎', gradient: 'green' },
  { id: 'snake', name: 'Snake', category: 'animals', emoji: '🐍', gradient: 'violet' },
  { id: 'crocodile', name: 'Crocodile', category: 'animals', emoji: '🐊', gradient: 'teal' },
  { id: 'dinosaur', name: 'Dinosaur', category: 'animals', emoji: '🦕', gradient: 'emerald' },
  { id: 't-rex', name: 'T-Rex', category: 'animals', emoji: '🦖', gradient: 'red' },
  
  // Fantasy - Magical creatures
  { id: 'unicorn', name: 'Unicorn', category: 'fantasy', emoji: '🦄', gradient: 'pink' },
  { id: 'dragon', name: 'Dragon', category: 'fantasy', emoji: '🐉', gradient: 'red' },
  { id: 'phoenix', name: 'Phoenix', category: 'fantasy', emoji: '🔥', gradient: 'orange' },
  { id: 'wizard', name: 'Wizard', category: 'fantasy', emoji: '🧙‍♂️', gradient: 'purple' },
  { id: 'witch', name: 'Witch', category: 'fantasy', emoji: '🧙‍♀️', gradient: 'indigo' },
  { id: 'fairy', name: 'Fairy', category: 'fantasy', emoji: '🧚‍♀️', gradient: 'pink' },
  { id: 'mermaid', name: 'Mermaid', category: 'fantasy', emoji: '🧜‍♀️', gradient: 'teal' },
  { id: 'vampire', name: 'Vampire', category: 'fantasy', emoji: '🧛‍♂️', gradient: 'red' },
  { id: 'genie', name: 'Genie', category: 'fantasy', emoji: '🧞‍♂️', gradient: 'violet' },
  { id: 'elf', name: 'Elf', category: 'fantasy', emoji: '🧝‍♀️', gradient: 'emerald' },
  { id: 'zombie', name: 'Zombie', category: 'fantasy', emoji: '🧟‍♂️', gradient: 'green' },
  
  // Objects - Fun tech and space themed
  { id: 'robot', name: 'Robot', category: 'objects', emoji: '🤖', gradient: 'blue' },
  { id: 'alien', name: 'Alien', category: 'objects', emoji: '👽', gradient: 'green' },
  { id: 'rocket', name: 'Rocket', category: 'objects', emoji: '🚀', gradient: 'red' },
  { id: 'satellite', name: 'Satellite', category: 'objects', emoji: '🛰️', gradient: 'cyan' },
  { id: 'computer', name: 'Computer', category: 'objects', emoji: '💻', gradient: 'blue' },
  { id: 'crystal', name: 'Crystal', category: 'objects', emoji: '💎', gradient: 'purple' },
  { id: 'star', name: 'Star', category: 'objects', emoji: '⭐', gradient: 'yellow' },
  { id: 'lightning', name: 'Lightning', category: 'objects', emoji: '⚡', gradient: 'amber' },
  { id: 'rainbow', name: 'Rainbow', category: 'objects', emoji: '🌈', gradient: 'violet' },
  { id: 'crown', name: 'Crown', category: 'objects', emoji: '👑', gradient: 'amber' },
  { id: 'trophy', name: 'Trophy', category: 'objects', emoji: '🏆', gradient: 'yellow' },
  { id: 'medal', name: 'Medal', category: 'objects', emoji: '🏅', gradient: 'orange' },
];

interface AvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBackground?: boolean;
}

export default function Avatar({ avatarId, size = 'md', className = '', showBackground = true }: AvatarProps) {
  // Check if it's a custom avatar (data URL)
  if (avatarId.startsWith('data:image/') || avatarId.startsWith('custom:')) {
    const imageUrl = avatarId.startsWith('custom:') ? avatarId.slice(7) : avatarId;
    return (
      <div className={`${getSizeClasses(size)} rounded-full overflow-hidden ${className}`}>
        <img
          src={imageUrl}
          alt="Custom avatar"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
  
  if (!avatar) {
    // Fallback to default developer avatar
    const defaultAvatar = AVATAR_OPTIONS[0]; // Developer
    return (
      <div className={`${getSizeClasses(size)} ${showBackground ? gradients[defaultAvatar.gradient as keyof typeof gradients] : ''} rounded-full flex items-center justify-center ${className}`}>
        <span className={`${getEmojiSize(size)} ${showBackground ? 'drop-shadow-sm' : ''}`}>
          {defaultAvatar.emoji}
        </span>
      </div>
    );
  }

  // Handle custom avatars with stored URLs
  if (avatar.customImageUrl) {
    return (
      <div className={`${getSizeClasses(size)} rounded-full overflow-hidden ${className}`}>
        <img
          src={avatar.customImageUrl}
          alt={avatar.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${getSizeClasses(size)} ${showBackground ? gradients[avatar.gradient as keyof typeof gradients] : ''} rounded-full flex items-center justify-center ${className}`}>
      {avatar.emoji && (
        <span className={`${getEmojiSize(size)} ${showBackground ? 'drop-shadow-sm' : ''}`}>
          {avatar.emoji}
        </span>
      )}
      {avatar.icon && !avatar.emoji && avatar.icon}
    </div>
  );
}

function getSizeClasses(size: string): string {
  switch (size) {
    case 'sm': return 'w-6 h-6';
    case 'md': return 'w-8 h-8';
    case 'lg': return 'w-12 h-12';
    case 'xl': return 'w-16 h-16';
    default: return 'w-8 h-8';
  }
}

function getEmojiSize(size: string): string {
  switch (size) {
    case 'sm': return 'text-sm';
    case 'md': return 'text-base';
    case 'lg': return 'text-2xl';
    case 'xl': return 'text-3xl';
    default: return 'text-base';
  }
}