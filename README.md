# MKV Audio Remover

The purpose of this tool is to remove all audio tracks on MKV files except for Japanese language tracks. I did this mostly to clean anime from all dub audio since I prefer to watch it in the original language.

For this, MKVToolNix is used, so it should be previously installed.

## Requirements

- MKVToolNix
- Node.js

## How to run

```bash
node run.mjs {path to your anime directory}
```

## TODO

- [x] Create batch file to run the script more elegantly
- [x] Handle errors more elegantly
- [ ] Test more rigorously
- [x] Try to include a portable version of MKVToolNix or look into MKV Cleaver
- [x] Decouple MKV logic into another function
- [x] Double check console feedback
