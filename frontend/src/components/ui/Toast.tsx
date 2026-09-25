import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="bg-white border border-[#E1E5EA] rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
        <div className="flex-shrink-0 w-6 h-6 bg-[#138808]/10 rounded-full flex items-center justify-center">
          <Check className="h-4 w-4 text-[#138808]" />
        </div>
        <p className="flex-1 text-sm text-[#1F2933]">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 p-1 hover:bg-[#F5F7FA] rounded text-[#5A6472]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
