import { Vehicle } from "./vehicle";

export interface DialogData {
  entrypoints: number,
  customers: Vehicle[],
  baseTime: Date
}
