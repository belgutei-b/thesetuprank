import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Setup Rank" },
    { name: "description", content: "Welcome to Setup Rank!" },
  ];
}

export default function Home() {
  return <div>Home</div>;
}
