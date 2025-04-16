import { Loader2 } from "lucide-react";
import React from "react";

function Loading() {
  return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)] w-full">
      <Loader2 size={64} className="animate-spin text-black" />
    </div>
  );
}

export default Loading;
