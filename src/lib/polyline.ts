/**
 * Google encoded polyline algorithm, precision 5.
 * Coordinates are [latitude, longitude] pairs, in that order (the order the
 * algorithm defines). Pure functions, no dependencies, no I/O.
 */

const PRECISION = 1e5;
const MAX_LAT = 90;
const MAX_LON = 180;

/** Appends one zig-zag encoded delta to the output chunks. */
function encodeSigned(value: number, out: string[]): void {
  let v = value < 0 ? ~(value << 1) : value << 1;
  while (v >= 0x20) {
    out.push(String.fromCharCode((0x20 | (v & 0x1f)) + 63));
    v >>>= 5;
  }
  out.push(String.fromCharCode(v + 63));
}

function checkCoordinate(value: unknown, limit: number, index: number, axis: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`encodePolyline: point ${index} has a non-finite ${axis}`);
  }
  if (value < -limit || value > limit) {
    throw new RangeError(`encodePolyline: point ${index} ${axis} ${value} is out of range`);
  }
  return value;
}

/**
 * Encodes [lat, lon] points. Throws on non-finite or out-of-range input rather
 * than emitting a polyline that decodes to nonsense.
 */
export function encodePolyline(points: Array<[number, number]>): string {
  if (!Array.isArray(points)) {
    throw new TypeError("encodePolyline: expected an array of points");
  }
  const out: string[] = [];
  let prevLat = 0;
  let prevLon = 0;
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!Array.isArray(point) || point.length < 2) {
      throw new TypeError(`encodePolyline: point ${i} is not a [lat, lon] pair`);
    }
    const lat = Math.round(checkCoordinate(point[0], MAX_LAT, i, "latitude") * PRECISION);
    const lon = Math.round(checkCoordinate(point[1], MAX_LON, i, "longitude") * PRECISION);
    encodeSigned(lat - prevLat, out);
    encodeSigned(lon - prevLon, out);
    prevLat = lat;
    prevLon = lon;
  }
  return out.join("");
}

/**
 * Decodes an encoded polyline back into [lat, lon] pairs.
 * Throws on malformed input; an empty string decodes to an empty array.
 */
export function decodePolyline(encoded: string): Array<[number, number]> {
  if (typeof encoded !== "string") {
    throw new TypeError("decodePolyline: expected a string");
  }
  const points: Array<[number, number]> = [];
  const len = encoded.length;
  let index = 0;
  let lat = 0;
  let lon = 0;

  const readSigned = (): number => {
    let result = 0;
    let shift = 0;
    let chunk = 0;
    do {
      if (index >= len) {
        throw new Error("decodePolyline: truncated value at end of input");
      }
      chunk = encoded.charCodeAt(index) - 63;
      index += 1;
      if (chunk < 0 || chunk > 0x3f) {
        throw new Error(`decodePolyline: invalid character at offset ${index - 1}`);
      }
      result |= (chunk & 0x1f) << shift;
      shift += 5;
      if (shift > 30 && chunk >= 0x20) {
        throw new Error(`decodePolyline: value overflow at offset ${index - 1}`);
      }
    } while (chunk >= 0x20);
    return (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
  };

  while (index < len) {
    lat += readSigned();
    lon += readSigned();
    points.push([lat / PRECISION, lon / PRECISION]);
  }
  return points;
}
