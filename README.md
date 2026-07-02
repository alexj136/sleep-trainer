A PWA toddler sleep trainer app to run on old smartphones.

Basically two webpages, the first generates a parameterised URL with the user's options (dawn time, wake up time, etc) and a second webpage which retrieves these parameters and displays each image at the specified time.

Run locally with:

```
python3 -m http.server 8766
```

And then open [this link](http://localhost:8766/index.html) in your browser.
