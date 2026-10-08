import { describe, expect, it } from "vitest";
import { commercialSeoCopy } from "@/lib/commercialSeoCopy";
import { developerListingLanguageGuidance } from "@/lib/developerListingLanguageGuidance";
import { developerMarketplaceCopy } from "@/lib/developerMarketplaceCopy";
import { pricingPageCopy } from "@/lib/pricingPageCopy";
import { pricingDetailsCopy } from "@/lib/pricingDetailsCopy";
import { pricingUiLabels } from "@/lib/pricingUiLabels";
import { officialSellerTermsLabels, sellerTermsTranslations } from "@/lib/sellerTermsLocalization";

const supportedLanguages = Object.keys(commercialSeoCopy);

describe("marketplace localization catalogs", () => {
  it("covers pricing and developer marketplace copy in every supported language", () => {
    for (const language of supportedLanguages) {
      expect(pricingPageCopy[language], `pricing page: ${language}`).toBeDefined();
      expect(pricingUiLabels[language], `pricing labels: ${language}`).toBeDefined();
      expect(pricingDetailsCopy[language], `pricing details: ${language}`).toBeDefined();
      expect(developerMarketplaceCopy[language], `developer marketplace: ${language}`).toBeDefined();
      expect(developerListingLanguageGuidance[language], `listing language guidance: ${language}`).toBeDefined();
    }
  });

  it("translates seller terms and identifies the binding Italian original in every supported language", () => {
    expect(Object.keys(sellerTermsTranslations).sort()).toEqual([...supportedLanguages].sort());
    expect(Object.keys(officialSellerTermsLabels).sort()).toEqual([...supportedLanguages].sort());

    for (const language of supportedLanguages) {
      expect(sellerTermsTranslations[language], `seller terms: ${language}`).toHaveLength(10);
      expect(officialSellerTermsLabels[language], `Italian original label: ${language}`).toBeTruthy();
      expect(developerMarketplaceCopy[language].termsAreItalian, `seller terms notice: ${language}`).toBeTruthy();
    }

    expect(sellerTermsTranslations.it[0]).toContain("Il venditore è l'unico responsabile");
    expect(sellerTermsTranslations.en[0]).toContain("The seller is solely responsible");
    expect(officialSellerTermsLabels.de).toBe("Verbindliche italienische Originalfassung anzeigen");
    expect(developerMarketplaceCopy.de.termsAreItalian).toContain("italienische Originalfassung");
    expect(commercialSeoCopy.de.pricingHeading).toBe("Wähle den passenden Tarif für deinen Workflow");
    expect(pricingUiLabels.de.backToHome).toBe("Zurück zur Startseite");
  });

  it("keeps detailed bonus and feature copy localized in every supported language", () => {
    for (const language of supportedLanguages) {
      const details = pricingDetailsCopy[language];
      expect(details.trialHighlights, `${language} trial highlights`).toHaveLength(5);
      expect(details.bonusSteps, `${language} bonus steps`).toHaveLength(4);
      expect(details.bonusExample, `${language} bonus example`).toHaveLength(7);
      expect(details.allTrialFeatures, `${language} trial features`).toHaveLength(12);
      expect(details.collaborationUnavailable, `${language} collaboration status`).toBeTruthy();
    }
  });

});
