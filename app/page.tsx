import Hero from "@/components/Hero/hero";
import SuggestionTab from "@/components/Hero/suggestionTab";

export default function Home() {
  return (
    <main className="flex h-full w-full flex-col items-center justify-between">
      <Hero />
      <SuggestionTab />
    </main>
  );
}
