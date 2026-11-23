import { describe, expect, it } from "vitest";
import {
  formatSentinelNumber,
  localizeSentinelLimitation,
  localizeSentinelMapModelName,
  localizeSentinelModelName,
  localizeSentinelReferenceMeaning,
  localizeSentinelStepMessage,
  localizeSentinelWorldCoverName,
  normalizeSentinelReportLanguage,
} from "./sentinelReportLocalization";

describe("Sentinel report localization", () => {
  it("uses Spanish and Russian translations and locale-aware number formatting", () => {
    expect(localizeSentinelWorldCoverName("Alberi", "es")).toBe("Árboles");
    expect(localizeSentinelWorldCoverName("Alberi", "ru")).toBe("Деревья");
    expect(localizeSentinelLimitation(
      "Verifica la mappa in GIS e con dati indipendenti prima di usarla per decisioni operative o conclusioni scientifiche.",
      "es"
    )).toContain("Revise");
    expect(localizeSentinelLimitation(
      "La mappa e una classificazione esplorativa a 10 m; le etichette di training e riferimento sono ESA WorldCover 2021, non osservazioni di campo.",
      "ru"
    )).toContain("полевых наблюдений");
    expect(formatSentinelNumber(1234.5, "es", 1)).toContain(",5");
    expect(formatSentinelNumber(1234.5, "ru", 1)).toContain(",5");
  });

  it("falls back unsupported locales to English and recognizes every Latin/Cyrillic locale", () => {
    expect(normalizeSentinelReportLanguage("zh")).toBe("en");
    for (const locale of ["en","it","es","fr","de","pt","ru","pl","nl","tr","sv","da","no","fi","uk","cs"] as const) {
      expect(normalizeSentinelReportLanguage(locale)).toBe(locale);
    }
  });
  it("translates backend limitations into the selected report language", () => {
    expect(
      localizeSentinelLimitation(
        "La mappa e una classificazione esplorativa a 10 m; le etichette di training e riferimento sono ESA WorldCover 2021, non osservazioni di campo.",
        "en"
      )
    ).toContain("not field observations");
    expect(
      localizeSentinelLimitation(
        "Il test spaziale misura l'accordo con WorldCover su blocchi geografici esclusi dal training, non l'accuratezza rispetto a verita-terreno indipendenti.",
        "en"
      )
    ).toContain("independent ground truth");
    expect(
      localizeSentinelLimitation(
        "La differenza temporale tra WorldCover 2021 e la scena Sentinel-2 selezionata puo introdurre cambiamenti reali non rappresentati dalle etichette.",
        "en"
      )
    ).toContain("time difference");
    expect(
      localizeSentinelLimitation(
        "Verifica la mappa in GIS e con dati indipendenti prima di usarla per decisioni operative o conclusioni scientifiche.",
        "en"
      )
    ).toContain("Review the map in GIS");
  });

  it("localizes exported model descriptions and keeps Italian reports unchanged", () => {
    expect(localizeSentinelModelName("SVM lineare", "en")).toBe("Linear SVM");
    expect(
      localizeSentinelMapModelName(
        "Random Forest rifittata su campioni WorldCover bilanciati dell'AOI.",
        "en"
      )
    ).toBe(
      "Random Forest retrained on balanced WorldCover samples from the AOI"
    );
    expect(
      localizeSentinelMapModelName(
        "SVM lineare rifittata su campioni WorldCover bilanciati dell'AOI.",
        "en"
      )
    ).toBe("Linear SVM retrained on balanced WorldCover samples from the AOI");
    expect(
      localizeSentinelMapModelName(
        "Random Forest rifittata su campioni WorldCover bilanciati dell'AOI.",
        "it"
      )
    ).toBe(
      "Random Forest rifittata su campioni WorldCover bilanciati dell'AOI"
    );
  });

  it("localizes Sentinel analysis output, classes, and progress messages", () => {
    expect(localizeSentinelWorldCoverName("Alberi", "en")).toBe("Trees");
    expect(localizeSentinelWorldCoverName("Alberi", "it")).toBe("Alberi");
    expect(localizeSentinelWorldCoverName("Alberi", "uk")).toBe("Дерева");
    expect(
      localizeSentinelReferenceMeaning(
        "Etichette di riferimento 2021; non sono rilievi a terra indipendenti.",
        "en"
      )
    ).toBe("2021 reference labels; these are not independent ground surveys.");
    expect(
      localizeSentinelStepMessage(
        "Scena selezionata: S2B_33TTG_20210724_1_L2A con copertura nuvolosa di tile 0.02%.",
        "en"
      )
    ).toBe(
      "Selected scene: S2B_33TTG_20210724_1_L2A with 0.02% tile cloud cover."
    );
    expect(
      localizeSentinelStepMessage(
        "Validazione spaziale su blocchi da 500 m; 4349 campioni di training e 1132 di test.",
        "en"
      )
    ).toBe(
      "Spatial validation on 500 m blocks; 4349 training samples and 1132 test samples."
    );
    expect(
      localizeSentinelStepMessage(
        "Random Forest addestrata; valuto i blocchi geografici esclusi dal training.",
        "ru"
      )
    ).toContain("обучения");
    expect(
      localizeSentinelStepMessage(
        "Validazione spaziale su blocchi da 500 m; 4349 campioni di training e 1132 di test.",
        "uk"
      )
    ).toContain("навчальних");
    expect(
      localizeSentinelMapModelName(
        "SVM lineare rifittata su campioni WorldCover bilanciati dell'AOI.",
        "uk"
      )
    ).toContain("Лінійна SVM");
    expect(
      localizeSentinelLimitation(
        "Il test spaziale misura l'accordo con WorldCover su blocchi geografici esclusi dal training, non l'accuratezza rispetto a verita-terreno indipendenti.",
        "uk"
      )
    ).toContain("Просторовий тест");
  });
});
