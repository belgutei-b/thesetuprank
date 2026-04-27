import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("test-upload", "./routes/test-upload.tsx"),
] satisfies RouteConfig;
