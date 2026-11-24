export interface SpecimenPlate {
  id: string;
  label: string;
  location: string;
  src: string;
  cameraNote: string;
  halationFocus: { xPct: number; yPct: number }[];
}

export const PLATES: SpecimenPlate[] = [
  {
    id: "alpine",
    label: "Alpine",
    location: "Granite ridge, late sun",
    src: "/images/specimen-alpine.jpg",
    cameraNote: "Sony a7 IV · FE 50mm · ISO 100 · f/5.6",
    halationFocus: [
      { xPct: 24, yPct: 31 },
      { xPct: 37, yPct: 35 },
    ],
  },
  {
    id: "night",
    label: "Night",
    location: "Rain corner, 3200 K neon",
    src: "/images/specimen-night.jpg",
    cameraNote: "Sony a7 IV · FE 35mm · ISO 800 · f/2",
    halationFocus: [
      { xPct: 36, yPct: 24 },
      { xPct: 19, yPct: 19 },
      { xPct: 55, yPct: 43 },
      { xPct: 72, yPct: 38 },
    ],
  },
  {
    id: "dunes",
    label: "Dunes",
    location: "Atlantic dusk horizon",
    src: "/images/specimen-dunes.jpg",
    cameraNote: "Sony a7 IV · FE 55mm · ISO 160 · f/4",
    halationFocus: [{ xPct: 54, yPct: 60 }],
  },
  {
    id: "interior",
    label: "Interior",
    location: "North window plaster",
    src: "/images/specimen-interior.jpg",
    cameraNote: "Sony a7 IV · FE 40mm · ISO 160 · f/2.8",
    halationFocus: [{ xPct: 24, yPct: 34 }],
  },
];
