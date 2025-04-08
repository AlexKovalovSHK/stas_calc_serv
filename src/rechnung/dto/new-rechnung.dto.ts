import { RechnungUnit } from "./rechnungs_unit.dto";


export class NewRechnungDto {
  _id?: string
  rechnungsnummer: string;
  rechnungsdatum: string;
  zhlungsbedingungen: string;
  feilligkeitsdatum: string;
  name: string;
  strasse: string;
  hausNum: string;
  plz: string;
  ort: string;
  objektName: string;
  objektStrasse: string;
  objektHausNum: string;
  objektPlz: string;
  objektOrt: string;
  paragraph: string;
  rechnungUnits: RechnungUnit[];

  constructor(
    rechnungsnummer: string,
    rechnungsdatum: string,
    zhlungsbedingungen: string,
    feilligkeitsdatum: string,
    name: string,
    strasse: string,
    hausNum: string,
    plz: string,
    ort: string,
    objektName: string,
    objektStrasse: string,
    objektHausNum: string,
    objektPlz: string,
    objektOrt: string,
    paragraph: string,
    rechnungUnits: RechnungUnit[]
  ) {
    this.rechnungsnummer = rechnungsnummer;
    this.rechnungsdatum = rechnungsdatum;
    this.zhlungsbedingungen = zhlungsbedingungen;
    this.feilligkeitsdatum = feilligkeitsdatum;
    this.name = name;
    this.strasse = strasse;
    this.hausNum = hausNum;
    this.plz = plz;
    this.ort = ort;
    this.objektName = objektName;
    this.objektStrasse = objektStrasse;
    this.objektHausNum = objektHausNum;
    this.objektPlz = objektPlz;
    this.objektOrt = objektOrt;
    this.paragraph = paragraph;
    this.rechnungUnits = rechnungUnits;
  }
}
