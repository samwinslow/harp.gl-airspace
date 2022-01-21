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
