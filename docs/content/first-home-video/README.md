# First-home example video: scripts, prompts and render code

Made 13 to 15 Oct 2026. The video itself is `media/first-home-deposit-to-keys.mp4` (with `.vtt` captions and a poster) and plays on the Watch page as video v1.

- `NOTEBOOKLM_*`, `PIXVERSE_*`, `HEYGEN_40S_SCRIPT.txt`, `PROMPT_*`: scripts and prompts for AI video tools (Irish first-time buyer story, several lengths).
- `script2.py`, `make_audio2.py`, `timing2.json`: the reel script and timings.
- `render/prem2.py`, `render/notch.py`: the render code for the portal-themed video (Bricolage Grotesque + Figtree, LifeMap colours). `notch.py` removes the screen-recording pixel grid from the presenter footage.
- Notes: the presenter is AI-generated (HeyGen) and no adviser is named. The spoken audio ends before "LifeGoals"; re-generate the last line as "Start your plan on LifeMap" for a spoken ending. Figures on screen are illustrative: check them against `docs/pre-release-verify.md` before launch.
