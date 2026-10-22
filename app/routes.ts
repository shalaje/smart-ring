import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("ring", "routes/ring.tsx"), route("*", "routes/not-found.tsx")] satisfies RouteConfig;
