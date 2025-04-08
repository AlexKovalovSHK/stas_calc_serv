import { RechnungPosition } from "../models/rechnung-position.shema";

export class RechnungDto {
    _id?: string;
  rechnung: RechnungPosition[];
  preis: number;
  dataTime: Date;
}