# 🦀🕸️ web-core-internal!

## Guide to CM primitives

byte – 8-bit unsigned integer
word – 16-bit unsigned integer
nat – 32-bit unsigned integer

int8 – 8-bit signed integer
int16 – 16-bit signed integer
int – 32-bit signed integer
int64 – 64-bit signed integer

float – 32-bit floating-point value
double – 64-bit floating-point value

## Guide to Axes

The X axis is red.
The Y axis is green.
The Z axis is blue.

X is roll
Y is pitch
Z is yaw

## Guide to materials

### PHYSICALLY-BASED RENDERING

#### DIFFUSION & REFLECTION

https://marmoset.co/posts/basic-theory-of-physically-based-rendering/

Diffusion => diffuse => reflect specific color => albedo
Reflection => specular => reflect everything

#### TRANSLUCENCY & TRANSPARENCY

Translucent => colored light "comes out the back", eg. finger
Transparent => possible to see through, eg. glass window

#### METALNESS

Metal => low diffusion, high reflection, colored reflection
Non metal (dielectric) => high diffusion, low reflection, non-colored reflection

#### FRESNEL

Reflective at certain angles, not very big variety, less evident the less smooth

## OpenCTM

Triangle meshes in CmSym are stored in the OpenCTM format, lossy compressed using MG2 compression.

Development of the OpenCTM format seemed to have stopped around 2010. The format is mostly documented in the format specification, but lacks some parts, referring instead to the official C implementation for details.

This SDK previously used a common JavaScript version linked below, but have since switched to a custom Rust/Wasm implementation based on a combination of the JavaScript and C versions. Development of the Rust/Wasm version revealed some geometry bugs in the JavaScript version which has been corrected in the Rust/Wasm version.

#### References

-   [Format specification](http://openctm.sourceforge.net/media/FormatSpecification.pdf)
-   [Copy of the official implementation](https://git.configura.com/cet/external/base/-/tree/version11.0beta/dll/openCTM)
-   [JavaScript implementation](https://github.com/jcmellado/js-openctm/blob/master/src/ctm.js)
