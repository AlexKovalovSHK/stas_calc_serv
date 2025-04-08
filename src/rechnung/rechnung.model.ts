import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Rechnung, RechnungSchema } from "./models/rechnung.shema";
import { RechnungService } from "./service/rechnung.service";
import { RechnungController } from "./controller/rechnung.controller";
import { RechnungPosition, RechnungPositionSchema } from "./models/rechnung-position.shema";
import { DocumentPdf3Module } from "src/documents/document.module";


@Module({
    imports: [
        MongooseModule.forFeature([{name: Rechnung.name, schema: RechnungSchema}]),
        MongooseModule.forFeature([{name: RechnungPosition.name, schema: RechnungPositionSchema}]),
        DocumentPdf3Module
    ],
    controllers: [RechnungController],
    providers: [RechnungService],
    exports:[RechnungService]
})
export class RechnungModule {}