export interface SpecimenPlate {
  id: string;
  src: string;
  /** What the photograph shows, for its alternative text. */
  subject: string;
}

const plate = (id: string, subject: string): SpecimenPlate => ({
  id,
  src: `/images/specimen-${id}.jpg`,
  subject,
});

export const PLATES = {
  ridge: plate("ridge", "Sandstone foothills above a pine forest and a dry meadow in afternoon sun"),
  alpine: plate("alpine", "Snow-dusted granite ridge above a forested valley in late sun"),
  night: plate("night", "Rain-wet street corner at night with a neon diner sign and lit windows"),
  interior: plate("interior", "Stoneware jug on a wooden table in window light against a plaster wall"),
} as const;
