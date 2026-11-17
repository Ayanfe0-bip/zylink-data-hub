export type NetworkCode = "MTN" | "AIRTEL" | "GLO" | "9MOBILE";

export type DataPlan = {
  network: NetworkCode;
  planId: number;
  name: string;
  category: string;
  validity: string;
  providerPrice: number;
};

export const MELE_DATA_PLANS: DataPlan[] = [
  // MTN
  { network: "MTN", planId: 553, name: "110MB", category: "Gifting", validity: "1 day", providerPrice: 110 },
  { network: "MTN", planId: 602, name: "500MB", category: "SME", validity: "7 days", providerPrice: 280 },
  { network: "MTN", planId: 603, name: "1GB", category: "SME", validity: "1 day", providerPrice: 350 },
  { network: "MTN", planId: 530, name: "1GB", category: "SME", validity: "7 days", providerPrice: 399 },
  { network: "MTN", planId: 555, name: "1.2GB", category: "Gifting", validity: "30 days", providerPrice: 450 },
  { network: "MTN", planId: 604, name: "1GB", category: "SME", validity: "30 days", providerPrice: 500 },
  { network: "MTN", planId: 558, name: "1.5GB", category: "Gifting", validity: "2 days", providerPrice: 600 },
  { network: "MTN", planId: 561, name: "2.5GB", category: "Gifting", validity: "1 day", providerPrice: 750 },
  { network: "MTN", planId: 531, name: "2GB", category: "SME", validity: "7 days", providerPrice: 800 },
  { network: "MTN", planId: 605, name: "2GB", category: "SME", validity: "30 days", providerPrice: 900 },
  { network: "MTN", planId: 563, name: "2.5GB", category: "Gifting", validity: "2 days", providerPrice: 900 },
  { network: "MTN", planId: 564, name: "1.5GB", category: "Gifting", validity: "7 days", providerPrice: 1000 },
  { network: "MTN", planId: 565, name: "3.2GB", category: "Gifting", validity: "2 days", providerPrice: 1000 },
  { network: "MTN", planId: 539, name: "3GB", category: "SME", validity: "7 days", providerPrice: 1200 },
  { network: "MTN", planId: 606, name: "3GB", category: "SME", validity: "30 days", providerPrice: 1300 },
  { network: "MTN", planId: 607, name: "5GB", category: "SME", validity: "2 days", providerPrice: 1300 },
  { network: "MTN", planId: 529, name: "5GB", category: "SME", validity: "30 days", providerPrice: 1599 },
  { network: "MTN", planId: 567, name: "6GB", category: "Gifting", validity: "7 days", providerPrice: 2500 },
  { network: "MTN", planId: 591, name: "10GB", category: "SME", validity: "30 days", providerPrice: 3398 },
  { network: "MTN", planId: 569, name: "11GB", category: "Gifting", validity: "7 days", providerPrice: 3430 },
  { network: "MTN", planId: 614, name: "11GB", category: "Gifting", validity: "7 days", providerPrice: 3450 },
  { network: "MTN", planId: 568, name: "7GB", category: "Gifting", validity: "30 days", providerPrice: 3500 },
  { network: "MTN", planId: 541, name: "10GB", category: "Gifting", validity: "30 days", providerPrice: 4450 },
  { network: "MTN", planId: 615, name: "18.6GB Always ON", category: "SME2", validity: "30 days", providerPrice: 5500 },
  { network: "MTN", planId: 550, name: "20GB", category: "Gifting", validity: "7 days", providerPrice: 5500 },
  { network: "MTN", planId: 617, name: "20GB", category: "SME", validity: "30 days", providerPrice: 7200 },
  { network: "MTN", planId: 616, name: "45GB Always ON", category: "SME2", validity: "30 days", providerPrice: 9000 },
  { network: "MTN", planId: 608, name: "60GB", category: "Gifting", validity: "30 days", providerPrice: 14800 },
  { network: "MTN", planId: 536, name: "75GB", category: "Gifting", validity: "30 days", providerPrice: 18500 },
  { network: "MTN", planId: 524, name: "90GB", category: "Gifting", validity: "60 days", providerPrice: 27000 },
  { network: "MTN", planId: 609, name: "120GB", category: "Gifting", validity: "30 days", providerPrice: 27000 },
  { network: "MTN", planId: 610, name: "450GB", category: "Gifting", validity: "90 days", providerPrice: 88000 },
  { network: "MTN", planId: 538, name: "800GB", category: "Gifting", validity: "365 days", providerPrice: 125000 },
  { network: "MTN", planId: 611, name: "1500GB", category: "Gifting", validity: "365 days", providerPrice: 223000 },

  // AIRTEL
  { network: "AIRTEL", planId: 625, name: "200MB", category: "SME", validity: "2 days", providerPrice: 150 },
  { network: "AIRTEL", planId: 619, name: "600MB", category: "SME", validity: "2 days", providerPrice: 230 },
  { network: "AIRTEL", planId: 592, name: "1GB Social Plan", category: "SME", validity: "30 days", providerPrice: 350 },
  { network: "AIRTEL", planId: 626, name: "1GB", category: "SME", validity: "1 day", providerPrice: 400 },
  { network: "AIRTEL", planId: 623, name: "HOT 1GB", category: "SME", validity: "3 days", providerPrice: 350 },
  { network: "AIRTEL", planId: 571, name: "1GB", category: "Gifting", validity: "1 day", providerPrice: 500 },
  { network: "AIRTEL", planId: 573, name: "1.5GB", category: "Gifting", validity: "7 days (social)", providerPrice: 500 },
  { network: "AIRTEL", planId: 624, name: "HOT 1.5GB", category: "SME", validity: "1 day", providerPrice: 480 },
  { network: "AIRTEL", planId: 454, name: "2GB", category: "SME", validity: "2 days", providerPrice: 600 },
  { network: "AIRTEL", planId: 628, name: "1.5GB", category: "SME", validity: "7 days", providerPrice: 650 },
  { network: "AIRTEL", planId: 620, name: "1GB", category: "Gifting", validity: "7 days", providerPrice: 790 },
  { network: "AIRTEL", planId: 574, name: "2GB", category: "Gifting", validity: "30 days", providerPrice: 1500 },
  { network: "AIRTEL", planId: 455, name: "5GB", category: "SME", validity: "7 days", providerPrice: 1700 },
  { network: "AIRTEL", planId: 575, name: "3GB", category: "Gifting", validity: "30 days", providerPrice: 2000 },
  { network: "AIRTEL", planId: 622, name: "4GB", category: "SME", validity: "30 days", providerPrice: 2490 },
  { network: "AIRTEL", planId: 577, name: "6GB", category: "Gifting", validity: "7 days", providerPrice: 2500 },
  { network: "AIRTEL", planId: 627, name: "8GB", category: "SME", validity: "7 days", providerPrice: 2500 },
  { network: "AIRTEL", planId: 593, name: "8GB", category: "Gifting", validity: "30 days", providerPrice: 3500 },
  { network: "AIRTEL", planId: 578, name: "10GB", category: "Gifting", validity: "7 days", providerPrice: 3500 },
  { network: "AIRTEL", planId: 449, name: "10GB", category: "SME", validity: "30 days", providerPrice: 3600 },
  { network: "AIRTEL", planId: 579, name: "10GB", category: "Gifting", validity: "30 days", providerPrice: 4000 },
  { network: "AIRTEL", planId: 594, name: "18GB", category: "SME", validity: "7 days", providerPrice: 5500 },
  { network: "AIRTEL", planId: 479, name: "25GB", category: "Gifting", validity: "30 days", providerPrice: 8000 },

  // GLO
  { network: "GLO", planId: 596, name: "500MB", category: "Corporate Gifting", validity: "30 days", providerPrice: 250 },
  { network: "GLO", planId: 597, name: "1GB", category: "Corporate Gifting", validity: "30 days", providerPrice: 399 },
  { network: "GLO", planId: 598, name: "2GB", category: "Corporate Gifting", validity: "30 days", providerPrice: 820 },
  { network: "GLO", planId: 599, name: "3GB", category: "Corporate Gifting", validity: "30 days", providerPrice: 1200 },
  { network: "GLO", planId: 600, name: "5GB", category: "Corporate Gifting", validity: "30 days", providerPrice: 1980 },
  { network: "GLO", planId: 601, name: "10GB", category: "Corporate Gifting", validity: "30 days", providerPrice: 4200 },

  // 9MOBILE
  { network: "9MOBILE", planId: 629, name: "500MB", category: "Corporate Gifting", validity: "30 days", providerPrice: 250 },
  { network: "9MOBILE", planId: 630, name: "1GB", category: "Corporate Gifting", validity: "30 days", providerPrice: 490 },
  { network: "9MOBILE", planId: 631, name: "1.5GB", category: "SME", validity: "30 days", providerPrice: 740 },
  { network: "9MOBILE", planId: 632, name: "2GB", category: "Corporate Gifting", validity: "30 days", providerPrice: 980 },
  { network: "9MOBILE", planId: 633, name: "3GB", category: "Corporate Gifting", validity: "30 days", providerPrice: 1480 },
  { network: "9MOBILE", planId: 634, name: "4GB", category: "SME", validity: "30 days", providerPrice: 1980 },
  { network: "9MOBILE", planId: 635, name: "5GB", category: "Corporate Gifting", validity: "30 days", providerPrice: 2480 },
  { network: "9MOBILE", planId: 636, name: "10GB", category: "Corporate Gifting", validity: "30 days", providerPrice: 4850 }
];

export function getPlansByNetwork(network: NetworkCode): DataPlan[] {
  return MELE_DATA_PLANS.filter((plan) => plan.network === network);
}
