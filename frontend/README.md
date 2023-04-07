# TODO

## Fixes

<!-- Fix gifs flashing -->
<!-- Fix customization not initializing on Island -->

Fix tracks not playing on mobile (need to pause + play again)
++ a few pixels too large on the right
++ loading screen stays up on safari

## Implementations

<!-- GET THE USER WHEN SIGN, add it as condition to canInteract, so less row reads -->

'i' add 'click for more info' and open maybe a modal

- with faq, links
- in faq add 'how is my data stored' and tell playlists in spinamp and the rest on a database, button to export data

Page for collectors with ens/address after /
Customize personal page + show a track en avant
Create playlist
Share customized playlist as one-page
Create home page with explanations, guide, etc + beta caption
Form to fill for access: use deForm?
Export data button (get the favorites name & link with id, and shortened links?)

Split more components in stores

### SIWE:

- Before going to production, you likely want to invalidate nonces on logout to prevent replay attacks through session duplication (e.g. store expired nonce and make sure they can't be used again).

### Swarm

Increment radius smoothly on bass hits
And/or use scale for bass & brightness for high freqs
-> need to separate freqs more comprehensively (see THREE audio analyser)
--> see https://codesandbox.io/s/sinestezia-zg9xcf?file=/src/Canvas/Analyzer.js

# Tracks

- OAKK
- bloody white - RUN
- feels just like home
- All Night
- Blackbird
- The Holy - Generation

# Domains

esthesis.art (or .io but $60, or xyz)

# Links

https://dev.spinamp.xyz/
https://api.spinamp.xyz/v3/graphiql
https://spinamp.gitbook.io/spinamp-sdk/reference/api-reference/playlists
https://app.planetscale.com/0xpolarzero/esthesis
https://app.spinamp.xyz/explore
