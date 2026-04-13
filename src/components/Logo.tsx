export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* The Icon: A stylized 'C' with an upward profit arrow */}
      <svg 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10 text-blue-500"
      >
        <path 
          d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round"
        />
        <path 
          d="M20 20L32 8M32 8H24M32 8V16" 
          stroke="#4ade80" // Green arrow for profit
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      
      {/* The Text Name */}
      <div className="flex flex-col leading-none">
        <span className="text-xl font-extrabold text-white tracking-wide">
          CFD<span className="text-blue-500">TRADE</span>
        </span>
      </div>
    </div>
  );
}
