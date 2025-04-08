import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type RechnungPositionDocument = RechnungPosition & Document;

@Schema()
export class RechnungPosition {
  @Prop()
  beschreibung: string;

  @Prop()
  menge: number;

  @Prop()
  einzelpreis: number;

  @Prop()
  betrag: number;
}

export const RechnungPositionSchema = SchemaFactory.createForClass(RechnungPosition);
