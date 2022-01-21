interface Altitude {
  msl: number
  agl: number
  toString: () => string
  _inferredType: 'msl' | 'agl'
}

const parseInt_safe = (input: string): number => {
  const output = parseInt(input)
  if (!isNaN(output)) return output
  return 0
}

export const MAP_COLORS = {
  black: '#000',
  cyan: '#2a77bb',
  magenta: '#8b2656',
  darkCyan: '#0e4787',
  red: '#ff1111',
}

export const getAirspaceClass = (input: string): string | null => {
  if (!input) return null
  if (input.match(/^DZ/i)) return 'danger'
  if (input.match(/^A\d+/i)) return 'alert'
  if (input.match(/^R\d+/i)) return 'restricted'
  const airportRegex = /CLASS\s+([ABCDEG])/i
  return input.match(airportRegex)?.[1]?.toLowerCase() ?? null
}

export const getAltitudeType = (input: string): 'msl' | 'agl' => {
  if (/agl|gnd/i.test(input)) return 'agl'
  return 'msl'
}

export const parseAltitude = (input: string, elevation: number = 0): Altitude | null => {
  const feet = parseInt_safe(input)

  const output = {} as Altitude
  const altitudeType = getAltitudeType(input)

  if (altitudeType === 'agl') {
    output._inferredType = 'agl'
    output.agl = feet
    output.msl = feet + elevation
  } else {
    output._inferredType = 'msl'
    output.agl = feet - elevation
    output.msl = feet
  }

  output.toString = () => `${feet} ${altitudeType.toUpperCase()}`
  return output
}
