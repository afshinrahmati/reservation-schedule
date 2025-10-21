export class UpdateRoomCommand { constructor(public readonly userId:string, public readonly roomId:string, public readonly dto:{name?:string;slotDurationMin?:number}){} }
