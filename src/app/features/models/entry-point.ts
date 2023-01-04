import { ParkingSlot } from "./parking-slot";
export interface EntryPoint {
  name: string,
  totalSlots: number,
  slotSizeAllocation: number[],
  slots?: ParkingSlot[]
}
