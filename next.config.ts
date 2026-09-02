import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
<<<<<<< HEAD
=======
  output: "standalone",

  /**
   * Version skew protection for rolling deployments.
   *
   * Every container serving the same deployment must report the same id. When a
   * client's id doesn't match the server's, Next does a hard navigation instead
   * of a client-side one, so a browser can never mix assets or Server Action
   * ids from two different builds mid-rollout.
   *
   * This is a BUILD-time value baked into the output — `docker run -e` has no
   * effect on it. Supply it to `docker build`:
   *   docker build --build-arg DEPLOYMENT_ID=$(git rev-parse --short HEAD) .
   */
  deploymentId: process.env.DEPLOYMENT_ID,
};

export default nextConfig;
