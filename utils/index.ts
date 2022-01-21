interface Altitude {
  msl: number
  agl: number
  toString: () => string
}

const parseInt_safe = (input: string): number | null => {
  const output = parseInt(input)
  if (!isNaN(output)) return output
  return null
}

export const getAltitudeType = (input: string): 'msl' | 'agl' => {
  if (/agl/i.test(input)) return 'agl'
  return 'msl'
}

export const parseAltitude = (input: string, elevation: number): Altitude | null => {
  const feet = parseInt_safe(input)
  if (feet == null) return null

  const output = {} as Altitude
  const altitudeType = getAltitudeType(input)

  if (altitudeType === 'agl') {
    output.agl = feet
    output.msl = feet + elevation
  } else { // msl
    output.agl = feet - elevation
    output.msl = feet
  }

  output.toString = () => `${output} ${altitudeType.toUpperCase()}`
  return output
}
