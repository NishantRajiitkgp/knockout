import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Knockout — punch out on time",
    short_name: "Knockout",
    description:
      "Knockout watches the clock and reminds you to punch out the moment your shift ends.",
    start_url: "/",
    display: "standalone",
    background_color: "#07080a",
    theme_color: "#07080a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
