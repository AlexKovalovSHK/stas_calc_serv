import { NewRechnungDto } from "src/rechnung/dto/new-rechnung.dto";

export function pdfBody(rechnungDto: NewRechnungDto): string {
  const today = new Date();

  const tableRows =
    rechnungDto.rechnungUnits
      ?.map(
        (unit) => `
        <tr class="item">
          <td>${unit.beschreibung}</td>
          <td>${unit.menge}</td>
          <td>${unit.einzelpreis.toFixed(2)}€</td>
          <td>${unit.betrag.toFixed(2)}€</td>
        </tr>
      `,
      )
      .join('') || '';

  const totalAmount = rechnungDto.rechnungUnits
    .reduce((sum, unit) => sum + unit.betrag, 0)
    .toFixed(2);

  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>PDF Result Template</title>
   <style>
  .invoice-box {
    max-width: 800px;
    margin: auto;
    padding: 10px;
    font-size: 10px;
    line-height: 1.2;
    font-family: "Helvetica Neue", "Helvetica";
  }

  .margin-top {
    margin-top: 50px;
  }

  .justify-center {
    text-align: center;
  }

  .invoice-box table {
    width: 100%;
    line-height: 1.1;
    text-align: left;
    border-collapse: collapse;
  }

  .invoice-box table td {
    padding: 2px 5px;
    vertical-align: middle;
    line-height: 1.1;
  }

  .invoice-box table tr.top table td {
    padding-bottom: 1px;
  }

  .invoice-box table tr.top table td.title {
    font-size: 15px;
    line-height: 45px;
    color: #333;
  }

  .invoice-box table tr.information table td {
    padding-bottom: 1px;
  }

  .invoice-box table tr.heading td {
    background: #eee;
    border-bottom: 1px solid #ddd;
    font-weight: bold;
    padding: 2px 5px;
    height: 18px;
    line-height: 1.1;
  }

  .invoice-box table tr.item td {
    border-bottom: 1px solid #eee;
    padding: 2px 5px;
    height: 18px;
    line-height: 1.1;
  }

  .invoice-box table tr.item.last td {
    border-bottom: none;
  }
</style>

  </head>
  <body>
    <div class="invoice-box">
      <table cellpadding="0" cellspacing="0">
        <tr class="top">
          <td colspan="4">
            <table>
              <tr>
                <td>
                  <p style="font-size: 8px; line-height: 1.2; margin: 0;">Marius Ursoi</p>
                  <p style="font-size: 8px; line-height: 1.2; margin: 0;">Im Barm 13 - 30916 - Isernhagen</p>
                </td>
                <td style="text-align: right; font-size: 8px; line-height: 1.2; margin: 0;">
                  Rechnungsnummer: ${rechnungDto.rechnungsnummer} <br />
                  Rechnungsdatum: ${rechnungDto.rechnungsdatum}<br />
                  Zahlungsbedingungen: ${rechnungDto.zhlungsbedingungen}<br />
                  Fälligkeitsdatum: ${rechnungDto.feilligkeitsdatum}<br />
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr class="information">
          <td colspan="4">
            <table>
              <tr>
                <td>
                  <p style="font-size: 8px; line-height: 1.2; margin: 0;"><b>Rechnungsadresse</b><br />
                  ${rechnungDto.name}<br />
                  ${rechnungDto.strasse} ${rechnungDto.hausNum}<br />
                  ${rechnungDto.plz} ${rechnungDto.ort}<br /></p>

                  <div style="margin-top: 20px;">
                    <p style="font-size: 8px; line-height: 1.2; margin: 0;""><b>Lieferadresse</b><br />
                    ${rechnungDto.objektName}<br />
                    ${rechnungDto.objektStrasse} ${rechnungDto.objektHausNum}<br />
                    ${rechnungDto.objektPlz} ${rechnungDto.objektOrt}<br /></p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td colspan="4" style="height: 20px;"></td>
        </tr>

        <!-- Table headings -->
        <tr class="heading">
          <td>Beschreibung</td>
          <td>Menge</td>
          <td>Einzelpreis</td>
          <td>Betrag</td>
        </tr>

        <!-- Items -->
        ${tableRows}

        <!-- Total row -->
        <tr class="item last">
          <td colspan="3" style="text-align: right; font-weight: bold;">Gesamtbetrag:</td>
          <td>${totalAmount}€</td>
        </tr>
      </table>

      <div style="margin-top: 20px; font-size: 8px; line-height: 1.2;">
        <p>Gemäß §${rechnungDto.paragraph} Abs. 1 UStG enthält der ausgewiesene Betrag keine Umsatzsteuer.</p>
        <p>Bitte überweisen Sie den Gesamtpreis innerhalb von 7 Tagen auf das unten angegebene Bankkonto.</p>
      </div>

      <hr style="margin-top: 20px;" />

      <p class="justify-center" style="font-size: 8px; line-height: 1.2; margin: 0;">
        Kontoinhaber: Marius Ursoi
        Bank: Sparkasse Hannover
        SWIFT/BIC: SPKHDE2HXXX<br />
        IBAN: DE43250501800910582947
        Adresse: Im Barm 13 - 30916 - Isernhagen
        E-Mail: mariusursoi18@gmail.com
        Mobil: 017684677759<br />
        Paypal: mariusursoi18@gmail.com
      </p>
    </div>
  </body>
</html>
  `;
}
