export class CreateRoomCommand { constructor(public readonly userId: string, public readonly dto:{name:string;slotDurationMin:number}){} }
