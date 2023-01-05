export interface Vehicle {
  duration: number,
  plateNumber: string,
  carSize: number,
  ticket?: string,
  owner: string
  timeIn?: Date,
  timeOut?: Date,
  cluster?: number
}
