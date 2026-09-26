# Database Design

## Principles

- Start with structured product facts, not only marketing descriptions.
- Keep Beauty Passport separate from user authentication.
- Store review outcomes in a way that can power Similar-Me Reviews.
- Keep Match Score explainable and reproducible.
- Track analytics events without blocking product work.

## Core Entities

| Entity | Purpose |
| --- | --- |
| User | Authentication and ownership |
| BeautyProfile | User's beauty passport |
| Product | Sellable item |
| Brand | Product brand |
| Category | Product category |
| Ingredient | Ingredient facts |
| Concern | User/product concern such as acne, dryness, sensitivity |
| Review | User review |
| ReviewOutcome | Structured experience after use |
| Routine | Morning/night product plan |
| Cart | Shopping cart |
| Order | Purchase record |
| MatchScoreSnapshot | Stored score at a moment in time |
| AnalyticsEvent | Funnel and behavior tracking |

## MVP Data Strategy

Do not start with thousands of products.
Start with 50 to 150 products and require complete data:

- Suitable skin types
- Unsuitable skin types where known
- Concerns addressed
- Fragrance/alcohol flags when known
- Price tier
- Product role in routine
- Claims and limitations
- Verified review outcomes

