# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

A mobile-first installable PWA (React + Vite). Phones are the main device; it must also work on desktop.

## Users

- **Primary:** adults in Ireland who want to know whether they can afford their life goals, such as a first home, children, retirement or a career break. Most are laypeople with no financial training, using a phone, often in short sessions.
- **Secondary:**
  - Partners: credit unions, adviser firms, employers and agents. They white-label LifeMap and may change its planning standards for their customers.
  - Advisers: they receive bookings and read the customer's plan and Understand Me answers before a meeting.

## Product Purpose

LifeMap turns "what life do I want" into a map of goals over time, then shows how much of each goal future income and savings can cover. The customer can try what-ifs, download the plan, and book an authorised adviser. It gives preliminary guidance, not advice, and never recommends a product.

## Positioning

The plan starts from life goals placed on a timeline, not from products. Irish tax, PRSI, USC, pension and Central Bank rules are worked into every figure. One plan travels with the customer from a two-minute Discover glimpse through to a booked adviser, so nothing has to be asked twice.

## Operating Context

The journey has six phases: Discover → Define → Prepare → Understand → Get ready → Connect. These are specified in `docs/journey-spec.md`, and the xlsx Journey Book is binding.

The app has five tabs: Home · Explore · My Plan · Me · Experts. Explore holds the 28 calculators that are checked against `deliverables/LifeMap-Calculators-*.xlsx`.

The prototype HTML (`LifeGoals-Customer-Journey-Prototype.html`) is the design source of truth. Golden and Playwright tests hold the app to it.

## Capabilities and Constraints

- Every answer is asked once, then shown pre-filled and editable.
- Consent boxes always start unticked (CBI Consumer Protection Regulations 2025).
- No uploads and no money figures before an account exists. File bytes never go through the API: uploads use signed URLs, or go straight to Vimeo for video.
- Planning standards are LifeMap's own unless a partner has changed them. Values set by law (tax, USC, PRSI, State Pension, CBI limits) cannot be changed by a partner. Rates follow the plan's start year, and nothing from a Budget is used until it is final.
- Copy: plain English, UK/Irish spelling, €, short questions, and options of about six words or fewer.
- Deliberate differences from the prototype are made only when the product owner asks for them.

## Brand Commitments

- **Name:** "LifeMap" by DigiPro.AI.
- **Line:** "The life you'd like, mapped out."
- **Voice:** calm, plain and honest about uncertainty. Assumptions are labelled as planning assumptions, not predictions.
- **Look:** the visual system is the prototype's, held in `app/src/styles/prototype.css`.

## Evidence on Hand

- Calculator workbooks and verification reports are in `deliverables/`, and audits are in `docs/`.
- Photos and videos are in `media/`. The first-home video has an AI-generated presenter, so no adviser is named under it.
- There are no real customer testimonials, client logos or performance claims. Do not invent any.

## Product Principles

1. Guidance, not advice: never recommend a product, and always point to an authorised adviser for advice.
2. Ask once: reuse every answer, and never make the customer repeat themselves.
3. Simple first: anything a layperson would find overwhelming is cut or moved deeper.
4. Show the basis: every figure can be traced to its assumption and its source.
5. The customer controls their data: nothing is saved or shared without their say.

## Accessibility & Inclusion

WCAG 2.2 AA, as the European Accessibility Act requires for Irish financial services. Touch targets are at least 44px. Every screen must work with a screen reader and with text zoomed to 200%.
