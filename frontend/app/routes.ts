import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("rankings", "routes/rankings.tsx"),
  route("submit", "routes/submit.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
