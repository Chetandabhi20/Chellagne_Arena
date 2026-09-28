# P6 Acceptance Test Notes

## Regex Challenges
1. `validate-roll-number`
Correct Regex pattern: `^[0-9]{2}(CE|IT|CSE|EC)[0-9]{3}$`
Flags: None (default is fine, no `i` flag since it must be uppercase).

## Frontend Challenges
1. `center-that-div`
```html
<div class="stage">
  <div class="box">Center me</div>
</div>
```
```css
.stage { 
  width: 100%; 
  height: 320px; 
  background: #192320; 
  display: flex;
  justify-content: center;
  align-items: center;
}
.box { 
  width: 120px; 
  height: 120px; 
  background: #F05133; 
  color: #0B0F0E; 
  font-family: monospace; 
}
```

2. `rebuild-landing-page`
HTML: (leave starter as-is)
CSS:
```css
body { font-family: sans-serif; }
.cta { background-color: blue; border-radius: 4px; display: inline-block; padding: 10px; }
.features { display: flex; flex-direction: column; }
@media (min-width: 900px) {
  .features { flex-direction: row; }
}
footer { text-align: center; }
```

Running these solutions will result in all tests passing. The starter template will fail the tests.
