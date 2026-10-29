const unsplash = (photoId: string, width: number) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=80`;

export const IMAGES = {
  hero: {
    plate: unsplash("photo-1568901346375-23c9450c58cd", 1400),
  },
  menu: {
    classic: unsplash("photo-1568901346375-23c9450c58cd", 800),
    double: unsplash("photo-1550547660-d9450f859349", 800),
    stacked: unsplash("photo-1571091718767-18b5b1457add", 800),
    chicken: unsplash("photo-1606755962773-d324e0a13086", 800),
    fries: unsplash("photo-1573080496219-bb080dd4f877", 800),
    shake: unsplash("photo-1572490122747-3968b75cc699", 800),
    brownie: unsplash("photo-1564355808539-22fda35bed7e", 800),
  },
  services: {
    plate: unsplash("photo-1550547660-d9450f859349", 600),
    crew: unsplash("photo-1556910103-1c02745aae4d", 900),
  },
  gallery: {
    main: unsplash("photo-1561758033-d89a9ad46330", 1200),
    fries: unsplash("photo-1573080496219-bb080dd4f877", 600),
    shake: unsplash("photo-1572490122747-3968b75cc699", 600),
  },
  crew: {
    one: unsplash("photo-1577219491135-ce391730fb2c", 800),
    two: unsplash("photo-1583394838336-acd977736f90", 800),
    three: unsplash("photo-1595273670150-bd0c3c392e46", 800),
  },
  patrons: {
    sophia: unsplash("photo-1494790108377-be9c29b29330", 200),
    daniel: unsplash("photo-1500648767791-00dcc994a43e", 200),
    ava: unsplash("photo-1438761681033-6461ffad8d80", 200),
  },
  cta: {
    background: unsplash("photo-1571091718767-18b5b1457add", 1800),
  },
} as const;
