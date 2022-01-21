import { getAltitudeType } from "./index"

describe('getAltitudeType', () => {
  it('should parse agl', () => {
    expect(getAltitudeType(`2100 FT AGL`)).toEqual('agl')
    expect(getAltitudeType(`2100' AGL`)).toEqual('agl')
    expect(getAltitudeType(`2100 agl`)).toEqual('agl')
  })
  it('should parse msl', () => {
    expect(getAltitudeType(`2100 FT MSL`)).toEqual('msl')
    expect(getAltitudeType(`2100' MSL`)).toEqual('msl')
    expect(getAltitudeType(`2100 msl`)).toEqual('msl')
  })
  it('should assume msl if no reference given', () => {
    expect(getAltitudeType(`2100`)).toEqual('msl')
  })
})