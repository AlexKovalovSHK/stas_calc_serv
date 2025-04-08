import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { RechnungPosition } from './rechnung-position.shema';

export type RechnungDocument = Rechnung & Document;

@Schema()
export class Rechnung {
  _id?: string; // Можем добавить это поле, если оно понадобится для работы с MongoDB

  @Prop({ type: [RechnungPosition], required: true })
  rechnungUnits: RechnungPosition[]; // Это поле будет хранить массив объектов RechnungPosition

  @Prop({ required: true })
  rechnungsnummer: string;

  @Prop({ required: true })
  rechnungsdatum: string;

  @Prop({ required: true })
  zhlungsbedingungen: string;

  @Prop({ required: true })
  feilligkeitsdatum: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  strasse: string;

  @Prop({ required: true })
  hausNum: string;

  @Prop({ required: true })
  plz: string;

  @Prop({ required: true })
  ort: string;

  @Prop({ required: true })
  objektName: string;

  @Prop({ required: true })
  objektStrasse: string;

  @Prop({ required: true })
  objektHausNum: string;

  @Prop({ required: true })
  objektPlz: string;

  @Prop({ required: true })
  objektOrt: string;

  @Prop({ required: true })
  paragraph: string;

  @Prop()
  preis: number; // Это поле для хранения общей суммы

  @Prop()
  dataTime: Date;
}

export const RechnungSchema = SchemaFactory.createForClass(Rechnung);
