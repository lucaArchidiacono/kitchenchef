import React, { useEffect, useMemo, useRef, useState } from "react";

type RecipeCard = {
  id: number;
  title: string;
  imageUrl?: string | null;
  description?: string | null;
};

function useSwipeQueue() {
  const [queue, setQueue] = useState<RecipeCard[]>([]);
  const [likes, setLikes] = useState<RecipeCard[]>([]);
  const [swipeCount, setSwipeCount] = useState(0);

  useEffect(() => {
    (async () => {
      const resp = await fetch("/api/feed");
      const data = await resp.json();
      setQueue(data.items);
    })();
  }, []);

  async function handleSwipe(direction: "left" | "right") {
    const next = queue[0];
    if (!next) return;
    const rest = queue.slice(1);
    setQueue(rest);
    setSwipeCount((c) => c + 1);
    if (direction === "right") {
      setLikes((l) => [...l, next]);
    }

    const shouldCheck = Math.random() < 0.3 || swipeCount >= 9 || (direction === "right" && likes.length >= 1);
    if (shouldCheck && direction === "right") {
      try {
        const urls = JSON.parse(localStorage.getItem("userUrls") || "[]");
        const resp = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recentLikes: [...likes, next], urls }),
        });
        const data = await resp.json();
        if (data && data.decision === "cook") {
          alert(`Cook this: ${next.title}`);
        }
      } catch {
        // ignore
      }
    }

    if (rest.length < 3) {
      const resp = await fetch("/api/feed");
      const data = await resp.json();
      setQueue((q) => [...q, ...data.items]);
    }
  }

  return { queue, handleSwipe };
}

export default function SwipeDeck() {
  const { queue, handleSwipe } = useSwipeQueue();
  const top = queue[0];

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handleSwipe("left");
    if (e.key === "ArrowRight") handleSwipe("right");
  };

  return (
    <div tabIndex={0} onKeyDown={onKey} className="outline-none">
      {top ? (
        <div className="relative w-full h-96 bg-white rounded-xl shadow overflow-hidden">
          {top.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={top.imageUrl} alt={top.title} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 p-4 text-white">
            <h2 className="text-xl font-semibold">{top.title}</h2>
            {top.description && <p className="text-sm opacity-80 line-clamp-2">{top.description}</p>}
          </div>
        </div>
      ) : (
        <div className="w-full h-96 rounded-xl bg-gray-200 grid place-items-center">No more recipes</div>
      )}

      <div className="mt-4 flex justify-center gap-6">
        <button onClick={() => handleSwipe("left")} className="px-6 py-3 bg-gray-200 rounded-full">Skip</button>
        <button onClick={() => handleSwipe("right")} className="px-6 py-3 bg-green-600 text-white rounded-full">Like</button>
      </div>
      <p className="text-xs text-gray-500 mt-2">Use left/right arrow keys.</p>
    </div>
  );
}

