

export interface RechnungUnit {
    beschreibung: string
    menge: number
    einzelpreis: number
    betrag: number
}

export interface NewRechnungDto {
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
    rechnungUnits: RechnungUnit[]
  }
  