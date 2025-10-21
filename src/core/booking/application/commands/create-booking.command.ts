import {CreateBookingDto} from "../dto/create-booking.dto";

export class CreateBookingCommand { constructor(public readonly userId:string, public readonly dto:CreateBookingDto){} }
