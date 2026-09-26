# Architecture

## Stack Decision

Use TypeScript across the product.

Initial stack:

- Next.js App Router for the web app and server actions/routes
- PostgreSQL for relational product, user, order, review, and analytics data
- Prisma for schema management and typed database access
- Rule-based recommendation engine in server-side TypeScript
- RTL-first Persian UI

## Why This Stack

This project needs fast MVP speed and strong data modeling. A separate backend service can come later, but starting with a single Next.js application reduces operational complexity.

The important boundary is not a separate process at day one. The important boundary is clean modules:

- Passport
- Product catalog
- Recommendation
- Reviews
- Routine
- Cart and checkout
- Admin
- Analytics

## Recommendation Boundary

Match Score must not be hard-coded into frontend components.

The recommendation engine should:

- Accept a Beauty Profile and Product facts
- Evaluate transparent weighted rules
- Return score, positive reasons, warnings, and missing data notes
- Ignore sponsored placement when calculating score

## Admin Boundary

Admins must be able to manage:

- Products
- Brands
- Categories
- Product attributes
- Skin and hair suitability
- Concerns
- Inventory
- Media
- Reviews
- Routines
- Recommendation rules
- Orders
- Users

## Analytics Boundary

Events should be recorded from day one:

- Beauty Passport Started
- Beauty Passport Completed
- Product Viewed
- Match Explanation Opened
- Routine Created
- Routine Added To Cart
- Review Filtered By Similar Users
- Add To Cart
- Checkout Started
- Purchase
- Review Submitted
- Outcome Submitted

## Privacy And Trust

Beauty Passport is not medical diagnosis.
The product should avoid medical claims and direct serious conditions to professionals.
Explanations should be honest when data is incomplete.

