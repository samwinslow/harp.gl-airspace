import { getAltitudeType, parseAltitude } from "./index"

describe('getAltitudeType', () => {
  it('parses agl', () => {
    expect(getAltitudeType(`2100 FT AGL`)).toEqual('agl')
    expect(getAltitudeType(`2100' AGL`)).toEqual('agl')
    expect(getAltitudeType(`2100 agl`)).toEqual('agl')
  })

  it('parses msl', () => {
    expect(getAltitudeType(`2100 FT AMSL`)).toEqual('msl')
    expect(getAltitudeType(`2100' MSL`)).toEqual('msl')
    expect(getAltitudeType(`2100 msl`)).toEqual('msl')
  })

  it('returns agl for 0 ground reference', () => {
    expect(getAltitudeType(`GND`)).toEqual('agl')
    expect(getAltitudeType(`gnd`)).toEqual('agl')
  })

  it('assumes msl if no reference given', () => {
    expect(getAltitudeType(`2100`)).toEqual('msl')
  })
})

describe('parseAltitude', () => {
  it('returns a well-formatted object', () => {
    const alt = parseAltitude('1700 FT AMSL')
    expect(alt._inferredType).toBe('msl')
    expect(alt.agl).toBe(1700)
    expect(alt.msl).toBe(1700)
    expect(alt.toString()).toEqual('1700 MSL')
  })

  it('handles msl with elevation offset -> agl', () => {
    const alt = parseAltitude('1700 FT AMSL', 250)
    expect(alt._inferredType).toBe('msl')
    expect(alt.agl).toBe(1450)
    expect(alt.msl).toBe(1700)
    expect(alt.toString()).toEqual('1700 MSL')
  })

  it('handles agl with elevation offset -> msl', () => {
    const alt = parseAltitude('1450 FT AGL', 250)
    expect(alt._inferredType).toBe('agl')
    expect(alt.agl).toBe(1450)
    expect(alt.msl).toBe(1700)
    expect(alt.toString()).toEqual('1450 AGL')
  })

  it('handles gnd with elevation offset', () => {
    const alt = parseAltitude('GND', 250)
    expect(alt._inferredType).toBe('agl')
    expect(alt.agl).toBe(0)
    expect(alt.msl).toBe(250)
    expect(alt.toString()).toEqual('0 AGL')
  })
})
