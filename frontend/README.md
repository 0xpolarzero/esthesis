# TODO

## Fixes

<!-- Fix gifs flashing -->
<!-- Fix customization not initializing on Island -->

Fix tracks not playing on mobile (need to pause + play again)
++ a few pixels too large on the right
++ loading screen stays up on safari

## Implementations

Page for collectors with ens/address after /
Replace blockchain with database? planetscala + SIWE
Customize personal page + show a track en avant
Add referal links when it can be done
Create playlist
Share customized playlist as one-page
Create home page with explanations, guide, etc + beta caption
Find a way to scale (already hitting Alchemy throughput limit with 1 user)
Form to fill for allowlist
Export data button (get the favorites name & link with id, and shortened links?)

### SIWE:

- Before going to production, you likely want to invalidate nonces on logout to prevent replay attacks through session duplication (e.g. store expired nonce and make sure they can't be used again).

### Swarm

Increment radius smoothly on bass hits
And/or use scale for bass & brightness for high freqs
-> need to separate freqs more comprehensively (see THREE audio analyser)
--> see https://codesandbox.io/s/sinestezia-zg9xcf?file=/src/Canvas/Analyzer.js

### Later

Maybe use a ERC20 token for gasless? can easily deduct from transactions
deposit function to add credits
Use 'pay as you go' (just sign tx and pay, no need for whitelist) or whitelist (pay upfront and sign with our private key)
SUSTAINABILITY: too much tracks to load all if it gets more popular

# Promotion

Send on:
immersivewire
ben ziggy ziggy
coopahtroopa
twitter

# Tracks

OAKK
bloody white - RUN
feels just like home
All Night
Blackbird
The Holy - Generation

# Names

sensoria / sensory
esthesis.art (or .io but $60, or xyz)
