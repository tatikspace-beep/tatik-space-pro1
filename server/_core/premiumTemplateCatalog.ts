import { ADDITIONAL_PREMIUM_TEMPLATES } from "../data/additionalPremiumTemplates";

export const PREMIUM_TEMPLATE_CATALOG: Record<string, { name: string; priceEuro: number }> = {
  "saas-landing-pro": { name: "SaaS Landing Page", priceEuro: 29 },
  "ecommerce-luxury": { name: "E-commerce Luxury Store", priceEuro: 49 },
  "portfolio-developer": { name: "Portfolio Developer", priceEuro: 79 },
  "business-corporate": { name: "Business Corporate", priceEuro: 79 },
  "blog-magazine": { name: "Blog Magazine", priceEuro: 129 },
  "react-portfolio-pro": { name: "React Portfolio Pro", priceEuro: 129 },
  ...Object.fromEntries(
    ADDITIONAL_PREMIUM_TEMPLATES.map((template) => [
      template.id,
      { name: template.name, priceEuro: template.price },
    ]),
  ),
};
