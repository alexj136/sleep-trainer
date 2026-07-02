A PWA toddler sleep trainer app to run on old smartphones.

Basically two webpages, the first generates a parameterised URL with the user's options (dawn time, wake up time, etc) and a second webpage which retrieves these parameters and displays each image at the specified time.

Run locally with:

```
python3 -m http.server 8766
```

And then open [this link](http://localhost:8766/index.html) in your browser.

If working on a fresh checkout, run:

```
git config core.hooksPath .githooks
```

from the repo root to have `git commit` automatically put the most recent
commit time at the bottom of `index.html`.
