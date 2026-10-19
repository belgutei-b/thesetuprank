import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("rankings", "routes/rankings.tsx"),
  route("upload", "routes/upload.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
  route("profile", "routes/profile.tsx"),
  route("terms", "routes/terms.tsx"),
  route("privacy", "routes/privacy.tsx"),
] satisfies RouteConfig;
