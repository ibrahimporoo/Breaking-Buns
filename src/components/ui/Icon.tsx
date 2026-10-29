import type { ReactNode, SVGProps } from "react";

type IconDefinition = {
  paths: ReactNode;
  filled?: boolean;
};

const ICONS = {
  arrowUpRight: {
    paths: (
      <>
        <path d="M7 17 17 7" />
        <path d="M8 7h9v9" />
      </>
    ),
  },
  arrowLeft: {
    paths: <path d="M20 12H4M10 6l-6 6 6 6" />,
  },
  arrowRight: {
    paths: <path d="M4 12h16M14 6l6 6-6 6" />,
  },
  plus: {
    paths: <path d="M12 5v14M5 12h14" />,
  },
  minus: {
    paths: <path d="M5 12h14" />,
  },
  trash: {
    paths: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />,
  },
  bell: {
    paths: (
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    ),
  },
  settings: {
    paths: <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />,
  },
  receipt: {
    paths: (
      <>
        <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </>
    ),
  },
  creditCard: {
    paths: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </>
    ),
  },
  truck: {
    paths: (
      <>
        <path d="M2 6h12v10H2zM14 10h4l4 3v3h-8z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
  },
  store: {
    paths: <path d="M3 9l1-5h16l1 5M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 21V12M19 21V12M3 21h18" />,
  },
  utensils: {
    paths: <path d="M5 3v7a2 2 0 0 0 2 2v9M9 3v7M7 3v7M17 21V3c-2 2-3 5-3 8h3" />,
  },
  check: {
    paths: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  },
  menu: {
    paths: <path d="M4 7h16M4 12h16M4 17h16" />,
  },
  close: {
    paths: <path d="M6 6l12 12M18 6 6 18" />,
  },
  chevronDown: {
    paths: <path d="m6 9 6 6 6-6" />,
  },
  heart: {
    paths: (
      <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
    ),
  },
  star: {
    filled: true,
    paths: (
      <path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.6 6.7 19.4l1.1-5.9L3.5 9.4l5.9-.8L12 3.2z" />
    ),
  },
  burger: {
    paths: (
      <>
        <path d="M4.5 10.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6H4.5z" />
        <path d="M3.5 13.2h17" />
        <path d="M4.5 16h15" />
        <path d="M5.2 18.8c0 .9.7 1.7 1.6 1.7h10.4c.9 0 1.6-.8 1.6-1.7v-.8H5.2v.8z" />
      </>
    ),
  },
  flame: {
    filled: true,
    paths: (
      <path d="M12 2.8c.4 3 3.2 4.7 4.6 7.4 1.6 3.1.4 6.2-1.4 7.8-1.1 1-2.2 1.4-3.2 1.4s-2.1-.4-3.2-1.4c-1.8-1.6-3-4.7-1.4-7.8.8-1.5 1.9-2.4 2.6-3.6.5-.9.8-2.1 1-3.8z" />
    ),
  },
  shoppingBag: {
    paths: (
      <>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    ),
  },
  sparkles: {
    paths: (
      <>
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
      </>
    ),
  },
  calendarCheck: {
    paths: (
      <>
        <path d="M8 2v4M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
        <path d="m9 16 2 2 4-4" />
      </>
    ),
  },
  calendar: {
    paths: (
      <>
        <path d="M8 2v4M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
  },
  chefHat: {
    paths: (
      <>
        <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
        <path d="M6 17h12" />
      </>
    ),
  },
  clock: {
    paths: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
  },
  layoutGrid: {
    paths: (
      <>
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </>
    ),
  },
  mapPin: {
    paths: (
      <>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  phone: {
    paths: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
  },
  mail: {
    paths: (
      <>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </>
    ),
  },
  instagram: {
    paths: (
      <>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  facebook: {
    paths: (
      <path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2H7" />
    ),
  },
  x: {
    paths: (
      <>
        <path d="M4 4l11.733 16H20L8.267 4z" />
        <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
      </>
    ),
  },
  google: {
    paths: (
      <path d="M20.945 11a9 9 0 1 1-3.284-5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945z" />
    ),
  },
  logOut: {
    paths: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
  },
  users: {
    paths: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  shieldCheck: {
    paths: (
      <>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
} as const satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
};

export default function Icon({ name, ...props }: IconProps) {
  const { paths, filled = false }: IconDefinition = ICONS[name];

  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths}
    </svg>
  );
}
