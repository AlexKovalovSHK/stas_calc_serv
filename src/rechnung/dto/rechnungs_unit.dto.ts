export class RechnungUnit {
    beschreibung: string;
    menge: number;
    einzelpreis: number;
    betrag: number;
  
    constructor(beschreibung: string, menge: number, einzelpreis: number) {
      this.beschreibung = beschreibung;
      this.menge = menge;
      this.einzelpreis = einzelpreis;
      this.betrag = menge * einzelpreis; // Автоматически рассчитывается сумма
    }
  }
  