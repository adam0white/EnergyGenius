/**
 * Supplier Catalog - Real supplier electricity plans from Power to Choose
 *
 * This module contains 100 real supplier plans scraped from powertochoose.org:
 * - Multiple suppliers from Texas deregulated market
 * - Varied pricing and contract terms
 * - Different renewable percentages
 * - Real plan features and details
 *
 * Last updated: 2025-11-11
 * Data source: https://www.powertochoose.org
 */

import type { SupplierPlan } from './types';

/**
 * Array of real supplier plans for the recommendation engine
 * Data is immutable to prevent accidental modifications
 */
export const supplierCatalog: readonly SupplierPlan[] = [
	  {
	    id: "plan-nec-co-op-energy-residential-electric",
	    supplier: "NEC Co-op Energy",
	    planName: "Residential Electricity... Plain and simple.",
	    baseRate: 0.145,
	    monthlyFee: 9.95,
	    contractTermMonths: 0,
	    earlyTerminationFee: 0,
	    renewablePercent: 17,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "$15 cooperative membership fee. By joining the co-op you are becoming an owner of NEC Co-op Energy. Our rate is honest and all-inclusive. We never have hidden fees or gimmicks. Being a cooperative means we do not work for profit. Instead we pass on the savings to you! Throughout the year, you may receive money back through Capital Credits or PowerPerks on your bill."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-cirro-energy-smart-simple-36",
	    supplier: "CIRRO ENERGY",
	    planName: "Smart Simple 36",
	    baseRate: 0.157,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 395,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Paperless eBill and Bill Alert Options",
	      "24/7 Local Customer Service",
	      "NO FEES for VISA, DISCOVER & MC",
	      "Easy Online Account Access",
	      "This offer is for new customers only"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-cirro-energy-smart-simple-12",
	    supplier: "CIRRO ENERGY",
	    planName: "Smart Simple 12",
	    baseRate: 0.154,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Paperless eBill and Bill Alert Options",
	      "24/7 Local Customer Service",
	      "NO FEES for VISA, DISCOVER & MC",
	      "Easy Online Account Access",
	      "This offer is for new customers only"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-constellation-newene-12-month-usage-bill-",
	    supplier: "CONSTELLATION NEWENERGY INC",
	    planName: "12 Month Usage Bill Credit",
	    baseRate: 0.144,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-champion-energy-serv-champ-saver-12",
	    supplier: "CHAMPION ENERGY SERVICES LLC",
	    planName: "Champ Saver-12",
	    baseRate: 0.153,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-champion-energy-serv-green-energy-24",
	    supplier: "CHAMPION ENERGY SERVICES LLC",
	    planName: "Green Energy-24",
	    baseRate: 0.162,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 250,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-champion-energy-serv-champ-saver-24",
	    supplier: "CHAMPION ENERGY SERVICES LLC",
	    planName: "Champ Saver-24",
	    baseRate: 0.156,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 250,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-discount-power-saver-12",
	    supplier: "Discount Power",
	    planName: "Saver 12",
	    baseRate: 0.153,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Electronic Billing and auto payment via bank draft, credit card, or debit card available. This offer is for new customers only. Enroll through Power to Choose or by using special promo code; Promo Code Required: WQ4135."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-cirro-energy-smart-simple-24",
	    supplier: "CIRRO ENERGY",
	    planName: "Smart Simple 24",
	    baseRate: 0.156,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 295,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Paperless eBill and Bill Alert Options",
	      "24/7 Local Customer Service",
	      "NO FEES for VISA, DISCOVER & MC",
	      "Easy Online Account Access",
	      "This offer is for new customers only"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-champion-energy-serv-free-weekends-24",
	    supplier: "CHAMPION ENERGY SERVICES LLC",
	    planName: "Free Weekends-24",
	    baseRate: 0.157,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 250,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Free power from 12 midnight Friday night to 11:59 PM Sunday night. No monthly fee or minimum usage requirement. Indexed Solar Buyback Included."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-reliant-reliant-power-on-fle",
	    supplier: "RELIANT",
	    planName: "Reliant Power On Flex plan",
	    baseRate: 0.179,
	    monthlyFee: 9.95,
	    contractTermMonths: 0,
	    earlyTerminationFee: 0,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "This offer is for new customers only who enroll through Power to Choose."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-payless-power-ptc-6-month-prepaid",
	    supplier: "PAYLESS POWER",
	    planName: "PTC 6 Month - Prepaid",
	    baseRate: 0.148,
	    monthlyFee: 9.95,
	    contractTermMonths: 6,
	    earlyTerminationFee: 99,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Fixed price for 6 months with no credit check or deposit required. A minimum first payment of $75.00 is required to connect service."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-payless-power-ptc-12-month-prepaid",
	    supplier: "PAYLESS POWER",
	    planName: "PTC 12 Month - Prepaid",
	    baseRate: 0.158,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 99,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Fixed price for 12 months with no credit check or deposit required.  A first payment of $75.00 is required to connect service."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-ap-gas-electric-tx-l-trueclassic-6",
	    supplier: "AP GAS & ELECTRIC (TX) LLC",
	    planName: "TrueClassic 6",
	    baseRate: 0.128,
	    monthlyFee: 9.95,
	    contractTermMonths: 6,
	    earlyTerminationFee: 150,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Lock in a fixed rate plan that gives you price security for the next 6 months. Flexible. Affordable. Energy. That's APG&E!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-discount-power-saver-36",
	    supplier: "Discount Power",
	    planName: "Saver 36",
	    baseRate: 0.156,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 395,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Electronic Billing and auto payment via bank draft, credit card, or debit card available. This offer is for new customers only. Enroll through Power to Choose or by using special promo code; Promo Code Required: WQ4135."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-discount-power-saver-24",
	    supplier: "Discount Power",
	    planName: "Saver 24",
	    baseRate: 0.155,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 295,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Electronic Billing and auto payment via bank draft, credit card, or debit card available. This offer is for new customers only. Enroll through Power to Choose or by using special promo code; Promo Code Required: WQ4135."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-amigo-energy-sustainable-simply-d",
	    supplier: "AMIGO ENERGY",
	    planName: "Sustainable Simply Days - 3",
	    baseRate: 0.108,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "FREE electricity from 9:00 AM to 4:00 PM daily. A one-month GoodBundle setup and carbon offset purchase of $49.99 is required to enroll. Call (866) 327-0839 to enroll!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-tara-energy-balanced-days-bundle",
	    supplier: "TARA ENERGY",
	    planName: "Balanced Days Bundle - 3",
	    baseRate: 0.108,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "FREE electricity from 9:00 AM to 4:00 PM daily. A one-month GoodBundle setup and carbon offset purchase of $49.99 is required to enroll. Call (866) 327-0880 to enroll!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-tara-energy-sustainable-home-bun",
	    supplier: "TARA ENERGY",
	    planName: "Sustainable Home Bundle - 3",
	    baseRate: 0.108,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "A one-month GoodBundle setup and carbon offset purchase of $49.99 is required to enroll. Transmission and distribution charges passed through at cost. Call (866) 327-0880 to enroll!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-amigo-energy-sustainable-lifestyl",
	    supplier: "AMIGO ENERGY",
	    planName: "Sustainable Lifestyle - 3",
	    baseRate: 0.108,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "A one-month GoodBundle setup and carbon offset purchase of $49.99 is required to enroll. Transmission and distribution charges passed through at cost. Call (866) 327-0839 to enroll!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-amigo-energy-basics-ptc-60",
	    supplier: "AMIGO ENERGY",
	    planName: "Basics PTC - 60",
	    baseRate: 0.165,
	    monthlyFee: 9.95,
	    contractTermMonths: 60,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Ask for our PTC rates. Lock in your energy rate with no Base Charges, no Minimum Use fees or Payment fees! Transmission and distribution charges passed through at cost. Please refer to the Electricity Facts Label for additional details. Call our Customer Hotline at (866) 327-0839 to sign up today!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-tara-energy-basics-ptc-60",
	    supplier: "TARA ENERGY",
	    planName: "Basics PTC - 60",
	    baseRate: 0.165,
	    monthlyFee: 9.95,
	    contractTermMonths: 60,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Ask for our PTC rates. Lock in your energy rate with no Base Charges, no Minimum Use fees or Payment fees! Transmission and distribution charges passed through at cost. Please refer to the Electricity Facts Label for additional details. Call our Customer Hotline at (866) 327-0880 to sign up today!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-green-mountain-energ-pollution-free-e-plu",
	    supplier: "GREEN MOUNTAIN ENERGY COMPANY",
	    planName: "Pollution Free e-Plus 24 Choice",
	    baseRate: 0.172,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 295,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "Sign up for 100% Pollution Free Electricity today! For new customers only. This plan requires you to enroll in Tree Free billing and Auto Pay at greenmountain.com/myaccount within thirty (30) days of your service start date. Additional terms and conditions apply. See order confirmation page for details."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-green-mountain-energ-pollution-free-e-plu",
	    supplier: "GREEN MOUNTAIN ENERGY COMPANY",
	    planName: "Pollution Free e-Plus 12 Choice",
	    baseRate: 0.172,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "Sign up for 100% Pollution Free Electricity today! For new customers only. This plan requires you to enroll in Tree Free billing and Auto Pay at greenmountain.com/myaccount within thirty (30) days of your service start date. Additional terms and conditions apply. See order confirmation page for details."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-amigo-energy-basics-ptc-36",
	    supplier: "AMIGO ENERGY",
	    planName: "Basics PTC - 36",
	    baseRate: 0.165,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Ask for our PTC rates. Lock in your energy rate with no Base Charges, no Minimum Use fees or Payment fees! Transmission and distribution charges passed through at cost. Please refer to the Electricity Facts Label for additional details. Call our Customer Hotline at (866) 327-0839 to sign up today!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-just-energy-sustainable-living-b",
	    supplier: "JUST ENERGY",
	    planName: "Sustainable Living Bundle - 3",
	    baseRate: 0.108,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "A one-month GoodBundle setup and carbon offset purchase of $49.99 is required to enroll. Transmission and distribution charges passed through at cost. Call (866) 327-0821 to enroll!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-just-energy-sustainable-days-bun",
	    supplier: "JUST ENERGY",
	    planName: "Sustainable Days Bundle - 3",
	    baseRate: 0.108,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "FREE electricity from 9:00 AM to 4:00 PM daily. A one-month GoodBundle setup and carbon offset purchase of $49.99 is required to enroll. Call (866) 327-0821 to enroll!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-just-energy-autopay-ptc-plan-3",
	    supplier: "JUST ENERGY",
	    planName: "Autopay PTC Plan - 3",
	    baseRate: 0.108,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Ask for our PTC rates. Lock in your energy rate with no Base Charges, no Minimum Use fees or Payment fees! Transmission and distribution charges passed through at cost. Please refer to the Electricity Facts Label for additional details. Call our Customer Hotline at (866) 327-0821 to sign up today!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-reliant-reliant-power-on-12-",
	    supplier: "RELIANT",
	    planName: "Reliant Power On 12 Plan",
	    baseRate: 0.169,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "This offer is for new customers only who enroll through Power to Choose"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-reliant-reliant-power-on-24-",
	    supplier: "RELIANT",
	    planName: "Reliant Power On 24 Plan",
	    baseRate: 0.168,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 295,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "This offer is for new customers only who enroll through Power to Choose"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-direct-energy-autopay-texas-18",
	    supplier: "DIRECT ENERGY",
	    planName: "Autopay Texas 18",
	    baseRate: 0.165,
	    monthlyFee: 9.95,
	    contractTermMonths: 18,
	    earlyTerminationFee: 180,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Lock in a fixed Texas energy rate for 18 months! Monthly base charge $4.95. For new customers only. If you stop Auto Pay at any time during your contract, you will be charged an AutoPay Breakage Fee of $5/month. If you cancel your plan early, you will be charged a $180 early termination fee. Terms and conditions apply."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-chariot-energy-chariot-freedom",
	    supplier: "CHARIOT ENERGY",
	    planName: "Chariot Freedom",
	    baseRate: 0.189,
	    monthlyFee: 9.95,
	    contractTermMonths: 0,
	    earlyTerminationFee: 0,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Sign-up today and receive regret-free 100% clean renewable energy at prices competitive to traditional power. We’re committed to providing our customers transparency, simplicity and clean energy backed by world class customer experience."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-frontier-utilities-frontier-power-saver",
	    supplier: "FRONTIER UTILITIES",
	    planName: "Frontier Power Saver 6",
	    baseRate: 0.122,
	    monthlyFee: 9.95,
	    contractTermMonths: 6,
	    earlyTerminationFee: 150,
	    renewablePercent: 30,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "This offer is for new customers only who enroll through the Power to Choose website."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-gexa-energy-gexa-eco-choice-12",
	    supplier: "GEXA ENERGY",
	    planName: "Gexa Eco Choice 12",
	    baseRate: 0.139,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "Lock in a great fixed rate plan. |Free online bill pay and automatic billing options are also available.|This offer is for new customers only who enroll through the Power to Choose website."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-octopus-energy-octo-green-12",
	    supplier: "Octopus Energy",
	    planName: "Octo Green 12",
	    baseRate: 0.136,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "An energy plan that combines technology and green energy! Sign up and connect your qualifying smart device (thermostat or electric vehicle (EV)) to our Intelligent Octopus feature through our App for a lower Octopus Energy Charge. If no qualifying smart device is connected then the default Octopus Energy Charge shall apply. Please review to the Electricity Facts Label for additional details. More information on Intelligent Octopus terms and conditions can be found at https://assets.octopusenergy.com/x/e71b875d6d/intelligent-octopus-en.pdf. Interested in qualifying for the discounted rate, call one of our Energy Specials at (833) 628-6888! Qualifying smart thermostats include: Amazon, Honeywell, ecobee and Sensi. Qualifying EVs include: BMW, Tesla, Audi, Mini Cooper, Volkswagen, Porsche, Ford, and Jaguar."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-spark-energy-llc-choose-12",
	    supplier: "SPARK ENERGY LLC",
	    planName: "Choose 12",
	    baseRate: 0.148,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 100,
	    renewablePercent: 35,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-spark-energy-llc-choose-15",
	    supplier: "SPARK ENERGY LLC",
	    planName: "Choose 15",
	    baseRate: 0.152,
	    monthlyFee: 9.95,
	    contractTermMonths: 15,
	    earlyTerminationFee: 100,
	    renewablePercent: 35,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-reliant-reliant-power-on-36-",
	    supplier: "RELIANT",
	    planName: "Reliant Power on 36 Plan",
	    baseRate: 0.168,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 395,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "This offer is for new customers only who enroll through Power to Choose"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-direct-energy-autopay-texas-24",
	    supplier: "DIRECT ENERGY",
	    planName: "Autopay Texas 24",
	    baseRate: 0.167,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 295,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Lock in a fixed Texas energy rate for 24 months! Monthly base charge $4.95. For new customers only. If you stop Auto Pay at any time during your contract, you will be charged an AutoPay Breakage Fee of $5/month. If you cancel your plan early, you will be charged a $135 early termination fee. Terms and conditions apply."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-direct-energy-autopay-texas-36",
	    supplier: "DIRECT ENERGY",
	    planName: "Autopay Texas 36",
	    baseRate: 0.168,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 295,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Lock in a fixed Texas energy rate for 36 months! Monthly base charge $4.95. For new customers only. If you stop Auto Pay at any time during your contract, you will be charged an AutoPay Breakage Fee of $5/month. If you cancel your plan early, you will be charged a $135 early termination fee. Terms and conditions apply."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-true-power-true-value-12",
	    supplier: "TRUE POWER",
	    planName: "True Value 12",
	    baseRate: 0.136,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 300,
	    renewablePercent: 15,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-green-mountain-energ-pollution-free-e-plu",
	    supplier: "GREEN MOUNTAIN ENERGY COMPANY",
	    planName: "Pollution Free e-Plus 36 Choice",
	    baseRate: 0.172,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 395,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "Sign up for 100% Pollution Free Electricity today! This plan requires you to enroll in Tree Free billing and Auto Pay at greenmountain.com/myaccount within thirty (30) days of your service start date. Additional terms and conditions apply. See order confirmation page for details."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-constellation-newene-simple-switch-8",
	    supplier: "CONSTELLATION NEWENERGY INC",
	    planName: "Simple Switch 8",
	    baseRate: 0.134,
	    monthlyFee: 9.95,
	    contractTermMonths: 8,
	    earlyTerminationFee: 50,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "This offer is for first time customers only who enroll through the Power to Choose website. Check out our other great rates available! https://www.constellation.com/"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-true-power-true-value-36",
	    supplier: "TRUE POWER",
	    planName: "True Value 36",
	    baseRate: 0.149,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 300,
	    renewablePercent: 15,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-true-power-true-value-19",
	    supplier: "TRUE POWER",
	    planName: "True Value 19",
	    baseRate: 0.146,
	    monthlyFee: 9.95,
	    contractTermMonths: 19,
	    earlyTerminationFee: 300,
	    renewablePercent: 15,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-true-power-true-value-24",
	    supplier: "TRUE POWER",
	    planName: "True Value 24",
	    baseRate: 0.148,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 300,
	    renewablePercent: 15,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-true-power-true-value-32",
	    supplier: "TRUE POWER",
	    planName: "True Value 32",
	    baseRate: 0.147,
	    monthlyFee: 9.95,
	    contractTermMonths: 32,
	    earlyTerminationFee: 300,
	    renewablePercent: 15,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-ohmconnect-energy-connect-save-12-save",
	    supplier: "OhmConnect Energy",
	    planName: "Connect & Save 12 -      Save Energy. Get Paid.",
	    baseRate: 0.15,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Choose the energy company that pays you! Sign up for a low rate and earn rewards when you participate in our energy-saving events. Automate and earn more rewards with smart home devices after you sign up! Learn more at: tx.ohmconnect.com"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-direct-energy-autopay-texas-12",
	    supplier: "DIRECT ENERGY",
	    planName: "Autopay Texas 12",
	    baseRate: 0.165,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 24,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Lock in a fixed Texas energy rate for 12 months! Monthly base charge $4.95. For new customers only. If you stop Auto Pay at any time during your contract, you will be charged an AutoPay Breakage Fee of $5/month. If you cancel your plan early, you will be charged a $150 early termination fee. Terms and conditions apply."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-cleansky-energy-embrace-green-6-new-",
	    supplier: "CleanSky Energy",
	    planName: "Embrace Green 6 - New Customer Special",
	    baseRate: 0.128,
	    monthlyFee: 9.95,
	    contractTermMonths: 6,
	    earlyTerminationFee: 75,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "This plan is for new customers only. Autopay is required. Please enroll through the PowertoChoose sign up link. Have a question about a plan or need help placing an order? Call us: 1-888-733-5557 | Email us: CustomerCare@CleanSkyEnergy.com"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-cleansky-energy-embrace-green-12-new",
	    supplier: "CleanSky Energy",
	    planName: "Embrace Green 12 - New Customer Special",
	    baseRate: 0.142,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "This plan is for new customers only. Autopay is required. Please enroll through the PowertoChoose sign up link. Have a question about a plan or need help placing an order? Call us: 1-888-733-5557 | Email us: CustomerCare@CleanSkyEnergy.com"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-cleansky-energy-embrace-green-24-new",
	    supplier: "CleanSky Energy",
	    planName: "Embrace Green 24 - New Customer Special",
	    baseRate: 0.15,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 225,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "This plan is for new customers only. Autopay is required. Please enroll through the PowertoChoose sign up link. Have a question about a plan or need help placing an order? Call us: 1-888-733-5557 | Email us: CustomerCare@CleanSkyEnergy.com"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-tara-energy-basics-ptc-36",
	    supplier: "TARA ENERGY",
	    planName: "Basics PTC - 36",
	    baseRate: 0.165,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Ask for our PTC rates. Lock in your energy rate with no Base Charges, no Minimum Use fees or Payment fees! Transmission and distribution charges passed through at cost. Please refer to the Electricity Facts Label for additional details. Call our Customer Hotline at (866) 327-0880 to sign up today!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-cleansky-energy-embrace-green-36-new",
	    supplier: "CleanSky Energy",
	    planName: "Embrace Green 36 - New Customer Special",
	    baseRate: 0.15,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 275,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "This plan is for new customers only. Autopay is required. Please enroll through the PowertoChoose sign up link. Have a question about a plan or need help placing an order? Call us: 1-888-733-5557 | Email us: CustomerCare@CleanSkyEnergy.com"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-frontier-utilities-frontier-power-saver",
	    supplier: "FRONTIER UTILITIES",
	    planName: "Frontier Power Saver 3",
	    baseRate: 0.117,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 150,
	    renewablePercent: 30,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "This offer is for new customers only who enroll through the Power to Choose website."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-gexa-energy-gexa-eco-choice-3",
	    supplier: "GEXA ENERGY",
	    planName: "Gexa Eco Choice 3",
	    baseRate: 0.117,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 150,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "Lock in a great fixed rate plan. |Free online bill pay and automatic billing options are also available.|This offer is for new customers only who enroll through the Power to Choose website."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-ohmconnect-energy-connect-save-24-save",
	    supplier: "OhmConnect Energy",
	    planName: "Connect & Save 24 -      Save Energy. Get Paid.",
	    baseRate: 0.153,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 250,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Choose the energy company that pays you! Sign up for a low rate and earn rewards when you participate in our energy-saving events. Automate and earn more rewards with smart home devices after you sign up! Learn more at: tx.ohmconnect.com"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-frontier-utilities-frontier-power-saver",
	    supplier: "FRONTIER UTILITIES",
	    planName: "Frontier Power Saver 12",
	    baseRate: 0.139,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 30,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "This offer is for new customers only who enroll through the Power to Choose website."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-good-charlie-co-llc-goodenergy-24",
	    supplier: "GOOD CHARLIE & CO LLC",
	    planName: "GoodEnergy 24",
	    baseRate: 0.158,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 20,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Includes FREE 24/7 unlimited access to licensed veterinarians and $750 to fund an emergency vet bill. Covers up to 5 pets.  Plan requires paperless billing and communication."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-good-charlie-co-llc-goodenergy-12",
	    supplier: "GOOD CHARLIE & CO LLC",
	    planName: "GoodEnergy 12",
	    baseRate: 0.156,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 20,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Includes FREE 24/7 unlimited access to licensed veterinarians and $750 to fund an emergency vet bill. Covers up to 5 pets.  Plan requires paperless billing and communication."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-ohmconnect-energy-connect-save-36-save",
	    supplier: "OhmConnect Energy",
	    planName: "Connect & Save 36 -      Save Energy. Get Paid.",
	    baseRate: 0.154,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 250,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Choose the energy company that pays you!Sign up for a low rate and earn rewards when you participate in our energy-saving events. Automate and earn more rewards with smart home devices after you sign up!Learn more at: tx.ohmconnect.com"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-gexa-energy-gexa-eco-choice-plus",
	    supplier: "GEXA ENERGY",
	    planName: "Gexa Eco Choice Plus 12",
	    baseRate: 0.139,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "Lock in a great fixed rate plan. |Free online bill pay and automatic billing options are also available. |This offer is for customers who enroll through the Power to Choose website."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-ohmconnect-energy-connect-save-19-save",
	    supplier: "OhmConnect Energy",
	    planName: "Connect & Save 19 -      Save Energy. Get Paid.",
	    baseRate: 0.147,
	    monthlyFee: 9.95,
	    contractTermMonths: 19,
	    earlyTerminationFee: 150,
	    renewablePercent: 33,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Choose the energy company that pays you! Sign up for a low rate and earn rewards when you participate in our energy-saving events. Automate and earn more rewards with smart home devices after you sign up! Learn more at: tx.ohmconnect.com"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-spark-energy-llc-choose-6",
	    supplier: "SPARK ENERGY LLC",
	    planName: "Choose 6",
	    baseRate: 0.129,
	    monthlyFee: 9.95,
	    contractTermMonths: 6,
	    earlyTerminationFee: 100,
	    renewablePercent: 35,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-ranchero-power-smart-fixed-12",
	    supplier: "Ranchero Power",
	    planName: "Smart & Fixed - 12",
	    baseRate: 0.153,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 179,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "New and returning customers only."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-ranchero-power-ranchero-smart-fixed",
	    supplier: "Ranchero Power",
	    planName: "Ranchero Smart & Fixed - 18",
	    baseRate: 0.143,
	    monthlyFee: 9.95,
	    contractTermMonths: 18,
	    earlyTerminationFee: 179.99,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-ranchero-power-smart-fixed-36",
	    supplier: "Ranchero Power",
	    planName: "Smart & Fixed - 36",
	    baseRate: 0.149,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 179,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-ranchero-power-no-contract-advantag",
	    supplier: "Ranchero Power",
	    planName: "No Contract Advantage",
	    baseRate: 0.129,
	    monthlyFee: 9.95,
	    contractTermMonths: 1,
	    earlyTerminationFee: 0,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Get the advantage of no contracts! Leave anytime! Zero fees!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-southern-federal-pow-sofed-better-rate-36",
	    supplier: "SOUTHERN FEDERAL POWER LLC",
	    planName: "SoFed Better Rate - 36",
	    baseRate: 0.148,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 249,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-southern-federal-pow-sofed-try-us-out-now",
	    supplier: "SOUTHERN FEDERAL POWER LLC",
	    planName: "SoFed Try Us Out Now - 3",
	    baseRate: 0.133,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 39,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-southern-federal-pow-sofed-better-rate-12",
	    supplier: "SOUTHERN FEDERAL POWER LLC",
	    planName: "SoFed Better Rate - 12",
	    baseRate: 0.152,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 249,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "New and returning customers only."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-southern-federal-pow-sofed-better-rate-18",
	    supplier: "SOUTHERN FEDERAL POWER LLC",
	    planName: "SoFed Better Rate - 18",
	    baseRate: 0.142,
	    monthlyFee: 9.95,
	    contractTermMonths: 18,
	    earlyTerminationFee: 249,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-southern-federal-pow-variable-advantage",
	    supplier: "SOUTHERN FEDERAL POWER LLC",
	    planName: "Variable Advantage",
	    baseRate: 0.128,
	    monthlyFee: 9.95,
	    contractTermMonths: 1,
	    earlyTerminationFee: 0,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-spark-energy-llc-choose-5",
	    supplier: "SPARK ENERGY LLC",
	    planName: "Choose 5",
	    baseRate: 0.174,
	    monthlyFee: 9.95,
	    contractTermMonths: 5,
	    earlyTerminationFee: 100,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-trieagle-energy-lp-sure-value-36",
	    supplier: "TRIEAGLE ENERGY LP",
	    planName: "Sure Value 36",
	    baseRate: 0.145,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 20,
	    renewablePercent: 3,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Our rates are transparent. No hidden fees or minimum usage penalties. TDU delivery charges are built into the rates at no markup, so there’s no guessing about what you pay."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-revolution-energy-ll-stars-and-stripes-fl",
	    supplier: "REVOLUTION ENERGY LLC",
	    planName: "Stars and Stripes Flex",
	    baseRate: 0.128,
	    monthlyFee: 9.95,
	    contractTermMonths: 1,
	    earlyTerminationFee: 0,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "<br />Affordable, hassle-free energy from Revolution Energy, the company that has your back. Offer only available for new Revolution Energy customers. This plan is not eligible to be used in conjunction with any referral or promotional codes."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-revolution-energy-ll-stars-and-stripes-gr",
	    supplier: "REVOLUTION ENERGY LLC",
	    planName: "Stars and Stripes Green Flex",
	    baseRate: 0.129,
	    monthlyFee: 9.95,
	    contractTermMonths: 1,
	    earlyTerminationFee: 0,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "<br />100% green energy from Revolution Energy, the company that has your back. Offer only available for new Revolution Energy customers. This plan is not eligible to be used in conjunction with any referral or promotional codes."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-revolution-energy-ll-stars-and-stripes-9",
	    supplier: "REVOLUTION ENERGY LLC",
	    planName: "Stars and Stripes 9",
	    baseRate: 0.143,
	    monthlyFee: 9.95,
	    contractTermMonths: 9,
	    earlyTerminationFee: 175,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "<br />Affordable, hassle-free energy from Revolution Energy, the company that has your back. Offer only available for new Revolution Energy customers. This plan is not eligible to be used in conjunction with any referral or promotional codes."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-revolution-energy-ll-stars-and-stripes-12",
	    supplier: "REVOLUTION ENERGY LLC",
	    planName: "Stars and Stripes 12",
	    baseRate: 0.146,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 200,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Affordable, hassle-free energy from Revolution Energy, the company that has your back. Offer only available for new Revolution Energy customers. This plan is not eligible to be used in conjunction with any referral or promotional codes."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-revolution-energy-ll-stars-and-stripes-18",
	    supplier: "REVOLUTION ENERGY LLC",
	    planName: "Stars and Stripes 18",
	    baseRate: 0.145,
	    monthlyFee: 9.95,
	    contractTermMonths: 18,
	    earlyTerminationFee: 250,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Affordable, hassle-free energy from Revolution Energy, the company that has your back. Offer only available for new Revolution Energy customers. This plan is not eligible to be used in conjunction with any referral or promotional codes."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-revolution-energy-ll-stars-and-stripes-24",
	    supplier: "REVOLUTION ENERGY LLC",
	    planName: "Stars and Stripes 24",
	    baseRate: 0.149,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 300,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Affordable, hassle-free energy from Revolution Energy, the company that has your back. Offer only available for new Revolution Energy customers. This plan is not eligible to be used in conjunction with any referral or promotional codes."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-revolution-energy-ll-stars-and-stripes-36",
	    supplier: "REVOLUTION ENERGY LLC",
	    planName: "Stars and Stripes 36",
	    baseRate: 0.149,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 375,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Affordable, hassle-free energy from Revolution Energy, the company that has your back. Offer only available for new Revolution Energy customers. This plan is not eligible to be used in conjunction with any referral or promotional codes."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-revolution-energy-ll-liberty-bell-green-f",
	    supplier: "REVOLUTION ENERGY LLC",
	    planName: "Liberty Bell Green Flex",
	    baseRate: 0.129,
	    monthlyFee: 9.95,
	    contractTermMonths: 1,
	    earlyTerminationFee: 0,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "<br />100% green energy from Revolution Energy, the company that has your back. Offer only available for new Revolution Energy customers. This plan is not eligible to be used in conjunction with any referral or promotional codes."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-revolution-energy-ll-liberty-bell-flex",
	    supplier: "REVOLUTION ENERGY LLC",
	    planName: "Liberty Bell Flex",
	    baseRate: 0.128,
	    monthlyFee: 9.95,
	    contractTermMonths: 1,
	    earlyTerminationFee: 0,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "<br />Affordable, hassle-free energy from Revolution Energy, the company that has your back. Offer only available for new Revolution Energy customers. This plan is not eligible to be used in conjunction with any referral or promotional codes."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-trieagle-energy-lp-simple-savings-36",
	    supplier: "TRIEAGLE ENERGY LP",
	    planName: "Simple Savings 36",
	    baseRate: 0.158,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 20,
	    renewablePercent: 3,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Our rates are transparent. No hidden fees or minimum usage penalties. TDU delivery charges are built into the rates at no markup, so there’s no guessing about what you pay."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-trieagle-energy-lp-simple-savings-12",
	    supplier: "TRIEAGLE ENERGY LP",
	    planName: "Simple Savings 12",
	    baseRate: 0.152,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 20,
	    renewablePercent: 3,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Our rates are transparent. No hidden fees or minimum usage penalties. TDU delivery charges are built into the rates at no markup, so there’s no guessing about what you pay."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-trieagle-energy-lp-simple-green-36",
	    supplier: "TRIEAGLE ENERGY LP",
	    planName: "Simple Green 36",
	    baseRate: 0.168,
	    monthlyFee: 9.95,
	    contractTermMonths: 36,
	    earlyTerminationFee: 20,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "Our rates are transparent. No hidden fees or minimum usage penalties. TDU delivery charges are built into the rates at no markup, so there’s no guessing about what you pay."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-trieagle-energy-lp-simple-green-12",
	    supplier: "TRIEAGLE ENERGY LP",
	    planName: "Simple Green 12",
	    baseRate: 0.162,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 20,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "Our rates are transparent. No hidden fees or minimum usage penalties. TDU delivery charges are built into the rates at no markup, so there’s no guessing about what you pay."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-heritage-power-llc-ptc-simple-prepay-st",
	    supplier: "HERITAGE POWER LLC",
	    planName: "PTC Simple Prepay - Start with $30.00!",
	    baseRate: 0.149,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 50,
	    renewablePercent: 25,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Start with $30.00! No deposit required."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-payless-power-ptc-12-month-postpai",
	    supplier: "PAYLESS POWER",
	    planName: "PTC 12 Month - Postpaid",
	    baseRate: 0.148,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 199,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Fixed Price for 12 months.  No deposit with approved credit."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-payless-power-ptc-6-month-postpaid",
	    supplier: "PAYLESS POWER",
	    planName: "PTC 6 Month - Postpaid",
	    baseRate: 0.138,
	    monthlyFee: 9.95,
	    contractTermMonths: 6,
	    earlyTerminationFee: 149,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Fixed Price for 6 months.  No deposit with approved credit."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-payless-power-ptc-3-month-postpaid",
	    supplier: "PAYLESS POWER",
	    planName: "PTC 3 Month - Postpaid",
	    baseRate: 0.11,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 99,
	    renewablePercent: 26,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Fixed Price for 3 months.  No deposit with approved credit."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-gexa-energy-gexa-eco-choice-plus",
	    supplier: "GEXA ENERGY",
	    planName: "Gexa Eco Choice Plus 3",
	    baseRate: 0.117,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 150,
	    renewablePercent: 100,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "100% Renewable Energy",
	      "Fixed Rate",
	      "Lock in a great fixed rate plan. |Free online bill pay and automatic billing options are also available. |This offer is for customers who enroll through the Power to Choose website."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-abundance-energy-straight-forward-12",
	    supplier: "Abundance Energy",
	    planName: "Straight Forward 12",
	    baseRate: 0.147,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 150,
	    renewablePercent: 25,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Go to Abundance Energy website to see all plans and term lengths."
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-just-energy-basics-ptc-60",
	    supplier: "JUST ENERGY",
	    planName: "Basics PTC - 60",
	    baseRate: 0.165,
	    monthlyFee: 9.95,
	    contractTermMonths: 60,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Ask for our PTC rates. Lock in your energy rate with no Base Charges, no Minimum Use fees or Payment fees! Transmission and distribution charges passed through at cost. Please refer to the Electricity Facts Label for additional details. Call our Customer Hotline at (866) 327-0821 to sign up today!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-amigo-energy-basics-ptc-24",
	    supplier: "AMIGO ENERGY",
	    planName: "Basics PTC - 24",
	    baseRate: 0.165,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Ask for our PTC rates. Lock in your energy rate with no Base Charges, no Minimum Use fees or Payment fees! Transmission and distribution charges passed through at cost. Please refer to the Electricity Facts Label for additional details. Call our Customer Hotline at (866) 327-0839 to sign up today!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-tara-energy-basics-ptc-24",
	    supplier: "TARA ENERGY",
	    planName: "Basics PTC - 24",
	    baseRate: 0.165,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 175,
	    renewablePercent: 31,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Ask for our PTC rates. Lock in your energy rate with no Base Charges, no Minimum Use fees or Payment fees! Transmission and distribution charges passed through at cost. Please refer to the Electricity Facts Label for additional details. Call our Customer Hotline at (866) 327-0880 to sign up today!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-bkv-energy-daisy-3",
	    supplier: "BKV Energy",
	    planName: "Daisy 3",
	    baseRate: 0.134,
	    monthlyFee: 9.95,
	    contractTermMonths: 3,
	    earlyTerminationFee: 20,
	    renewablePercent: 29,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Simple and affordable fixed-rate electricity with no hidden fees like base charges, usage fees, setup fees, or bundle fees. Plus, no gimmicks or confusing fine print. This plan is for new customers only who enroll through the Power To Choose website. Sign up today!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-ap-gas-electric-tx-l-trueclassic-12",
	    supplier: "AP GAS & ELECTRIC (TX) LLC",
	    planName: "TrueClassic 12",
	    baseRate: 0.144,
	    monthlyFee: 9.95,
	    contractTermMonths: 12,
	    earlyTerminationFee: 200,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Lock in a straightforward fixed rate plan that gives you price security for the next 12 months. Flexible. Affordable. Energy. That's APG&E!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  },
	  {
	    id: "plan-ap-gas-electric-tx-l-trueclassic-24",
	    supplier: "AP GAS & ELECTRIC (TX) LLC",
	    planName: "TrueClassic 24",
	    baseRate: 0.149,
	    monthlyFee: 9.95,
	    contractTermMonths: 24,
	    earlyTerminationFee: 250,
	    renewablePercent: 6,
	    ratings: {
	      reliabilityScore: 3,
	      customerServiceScore: 3
	    },
	    features: [
	      "Fixed Rate",
	      "Lock in a fixed rate plan that gives you price security for the next 24 months. Flexible. Affordable. Energy. That's APG&E!"
	    ],
	    availableInStates: [
	      "TX"
	    ]
	  }
	] as const;

export default supplierCatalog;
