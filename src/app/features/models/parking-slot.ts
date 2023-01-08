import { Vehicle } from "./vehicle";
export interface ParkingSlot {
  availability: boolean,
  cluster: number,
  color?: string,
  distance: number,
  size: number,
  vehicle? : Vehicle
}
