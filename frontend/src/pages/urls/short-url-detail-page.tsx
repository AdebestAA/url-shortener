import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Scissors } from "lucide-react";

export default function ShortUrlDetailPage() {
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      window.location.replace(
        `${import.meta.env.VITE_API_BASE_URL}/urls/${id}`,
      );
    }
  }, [id]);

  return (
    <div className="bg-dots flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
      <span className="grid size-14 animate-bounce place-items-center rounded-2xl bg-ink text-acid">
        <Scissors className="size-6" />
      </span>
      <p className="font-display text-4xl">Taking you there…</p>
    </div>
  );
}
