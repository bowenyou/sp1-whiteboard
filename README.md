# SP1 - Whiteboard

Prove that you are the actual artist for an image!

## How it works

1. Users draws on a whiteboard.
2. The brush strokes are stored locally.
3. When user is finished with their masterpiece, the image is downloaded as a PNG.
4. Public input PNG + private input brush strokes are fed to SP1 prover.
5. Proof is generated to say whether or not the brush strokes correspond to the input image without revealing the brush strokes.

## Notes

- There is an issue with the exported image not being exactly equal to the output of recreating the brushstrokes on a blank image.
Not a frontend wizard so don't know why. We end up just using a similarity criteria (root mean square error below a certain threshold).
- Probably super inefficient, and proving time scales with size of image.
