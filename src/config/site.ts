export const siteConfig = {
  name: "Neighbourhood Commons",
  description:
    "Plan, promote, and discover trusted council, library, and children’s centre events across Islington.",
  area: "Islington, London",
  contactEmail: "mathieu.bayou@gmail.com",
  links: {
    github: "https://github.com/mbayou/community-event",
  },
  navigation: [
    { href: "/events", label: "Events" },
    { href: "/institutions", label: "Institutions" },
    { href: "/admin", label: "Admin" },
  ],
};

export type SiteConfig = typeof siteConfig;
