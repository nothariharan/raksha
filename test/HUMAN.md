# Human testing

A person has to do these. An agent cannot hear ElevenLabs, judge layout, or click Portal A/B the way a mentor will.

Default demo mobile on `/app` is `+919876543210`. That used to reuse one leftover `READY` case. Each **new** call or typed report should now create a **new** `RKS-*`. If the dossier shows Rohan Mehta / ₹4,850 / electricity bill after you told a different story, stop and fail the run.

## Before you start

1. `pnpm demo:reset` then `pnpm demo` from the repo root.
2. Confirm `.env.local` has `FIREWORKS_API_KEY` and `FIREWORKS_VISION_MODEL=accounts/fireworks/models/glm-5p3-flash`.
3. Hard-refresh http://localhost:3000/app
4. Optional: change the Mobile field to a number you have not used this session if you want extra isolation.

## 1. Live English call (must pass)

1. Click **Tell Raksha** / **Talk to Raksha**.
2. Pick **English**.
3. Speak a story that is *not* the old electricity / PhonePe demo. Example:

   > I tried to buy something. They asked for 5,000 rupees right away for a medical government issue, then said it was some tax. I paid from SBI. The UTR number is 1234567890. I did not use PhonePe or any UPI app. I think I got scammed.

4. Watch the **Gathered so far** pane on the right while you talk.

**Pass**
- Raksha stays in English for the whole call (no Hindi greeting mid-call).
- You can hear her (Core TTS). Mic transcript shows what you said.
- Dossier fills with **₹5,000**, **State Bank of India**, **1234567890**, and your story (medical / tax), not leftover PhonePe facts.
- Channel is bank transfer / blank, not PhonePe, if you said you did not use UPI.
- She does **not** say the report is already submitted after you say “yes, submit it.”
- After facts look complete, status is **Awaiting your confirmation**. You tap **Confirm these details**.
- She asks you to attach a payment screenshot.

**Fail**
- Dossier shows ₹4,850, PhonePe, `427891036542`, Rohan Mehta, or “electricity bill scam” when you never said that.
- She claims “submitted successfully” before you attach proof.
- Silent agent audio, or Hindi after you picked English.
- Same `RKS-000002` facts from an earlier proof test.

## 2. Proof upload then desks (must pass)

Stay on the same call after confirm.

1. Attach `apps/web/public/images/demo-proof/demo-proof-upi-phonepe.png` (or drag it onto the proof control).
2. Wait for **Verifying proof…** then filing.

**Pass**
- Badge moves: attach proof → verifying → filed.
- Call ends or outcome takes over: tracking reference (often `1930-SYN-…`).
- Two links: **1930 cyber cell desk** and **{bank} freeze desk**.
- Copy says this is simulated. Nothing else you need to do here.
- Open Portal A (http://localhost:3003) in a new tab. This case / reference is visible.
- Open Portal B (http://localhost:3004). Bank desk shows a freeze / lien-style response for this case.

**Fail**
- Proof never verifies (empty vision / heuristic-only) with a real Fireworks key.
- Outcome has no desk links.
- Portals are empty or show a *different* incident than the one on screen.

## 3. Second proof image (netbanking)

1. `pnpm demo:reset` or start a **new** call (do not continue the filed case).
2. Speak or type a short complete story (amount + bank + UTR).
3. Confirm, then upload `demo-proof-netbanking.png`.

**Pass**
- Vision reads ~$1,250 / transfer `#7842915` (or keeps your spoken amount if the story was different; “What happened” must stay *your* words, not a leftover electricity narrative).
- CAP still files and both desk links appear.

## 4. Typed intake (no voice)

1. Reset or File another report so `/app` is idle.
2. **Type details instead**.
3. Paste a full story (amount, SBI, UTR, no UPI).
4. **Understand Incident**.

**Pass**
- **Payment identified** card shows *this* text: ₹5,000, SBI, `1234567890`, not PhonePe if you denied UPI.
- **Send emergency report** is the orange button (no rocket emoji).
- After send (or after confirm+proof if the UI still asks for proof), Portal A/B links work.

**Fail**
- Card still shows the old ₹4,850 PhonePe dossier.

## 5. Screenshot from the home card

1. Idle `/app`.
2. **Show Transaction** / upload UPI screenshot (`demo-proof-upi-phonepe.png`).
3. Confirm if asked, then file.

**Pass**
- New `RKS-*` (not an old READY case’s facts unless you are continuing on purpose).
- Amount / UTR from the image show on the payment card.
- Filing still reaches both desks.

## 6. Mobile / narrow layout

1. DevTools device mode, 390×844 (or a real phone on the LAN).
2. Repeat a short typed path or glance the live-call panes.

**Pass**
- Conversation and dossier stack (no smashed two-column).
- Confirm / proof / Send emergency report stay on one line and readable.
- Outcome links are tappable.

**Fail**
- Overlapping panes, clipped orange button, horizontal overflow.

## 7. WhatsApp (human, if Twilio/Meta is wired)

Webhook is http://localhost:3005. Local demo may need the WhatsApp simulator or a tunnel.

1. Message a new fraud story from a test number.
2. Answer missing UTR / amount if asked.
3. When it says payment identified, reply **YES**.
4. Reply **STATUS**.

**Pass**
- YES on READY files CAP **without** a screenshot (WhatsApp has no proof gate).
- Reply includes tracking + Portal A + Portal B URLs.
- STATUS returns the same `RKS-*`.

**Fail**
- YES does nothing, or a new unrelated incident is created.

## 8. Phone / calling agent (human)

Phone tools live on http://localhost:3006.

1. Real ElevenLabs inbound call **or** the phone simulate UI if you use it.
2. Tell amount, bank, UTR.
3. Confirm when she reads back.
4. Let `submit_incident` run.

**Pass**
- She asks to send to 1930 and the bank, then files.
- Spoken copy includes both desk URLs.
- No screenshot step (phone has no proof gate).

## 9. Case drawer (human)

On `/app`, open **View technical case details**.

**Pass**
- Short status lines: Report started, Voice statement recorded, Payment proof attached, Filed with 1930 and bank.
- Not a 70-line JSON dump of every `case.updated`.

## Do not skip

| Check | Why a human |
|---|---|
| English stays English | Agent TTS / EL prompt |
| You hear Raksha | Audio path |
| Dossier matches *this* conversation | Visual + memory |
| Confirm → proof → file, not “already submitted” | Spoken lie vs UI |
| Portal A and B actually open this case | Browser tabs |
| Mobile stack | Layout |
| WhatsApp / phone YES files | Real channel, if available |
